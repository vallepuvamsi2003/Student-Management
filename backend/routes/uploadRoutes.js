const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const { protect, authorize } = require('../middleware/authMiddleware');
const Performance = require('../models/Performance');
const { sendStudentPerformanceEmail } = require('../utils/emailService');

// Multer Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath);
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

// @route   POST /api/upload/student-data
// @desc    Upload student performance data (CSV/Excel)
// @access  Private (Admin, Faculty)
router.post('/student-data', protect, authorize('Admin', 'Faculty'), upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const filePath = req.file.path;
        const results = [];

        if (req.file.originalname.endsWith('.csv')) {
            fs.createReadStream(filePath)
                .pipe(csv())
                .on('data', (data) => results.push(data))
                .on('end', () => processData(results, filePath, req, res));
        } else if (req.file.originalname.endsWith('.xlsx')) {
            const workbook = xlsx.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
            processData(data, filePath, req, res);
        } else {
            fs.unlinkSync(filePath);
            return res.status(400).json({ message: 'Unsupported file format' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error during upload', error: error.message });
    }
});

const processData = async (data, filePath, req, res) => {
    try {
        const savedRecords = [];
        const studentGroups = {}; // key: email, value: { name, records: [] }

        for (const row of data) {
            // Helper to find value by multiple possible header keys
            const getValue = (keys) => {
                for (const key of keys) {
                    if (row[key] !== undefined) return row[key];
                    const foundKey = Object.keys(row).find(k => k.trim().toLowerCase() === key.toLowerCase());
                    if (foundKey) return row[foundKey];
                }
                return null;
            };

            const email = getValue(['Student Email', 'email', 'Email', 'studentEmail']);
            const name = getValue(['Student Name', 'name', 'Name', 'studentName']);
            const rollNumber = getValue(['Roll Number', 'roll', 'rollNumber', 'Roll']);
            const subject = getValue(['Subject', 'subject']);
            
            const attendanceVal = getValue(['Attendance Percentage', 'attendance', 'Attendance', 'attendancePercentage']);
            const marksVal = getValue(['Marks', 'marks', 'Mark', 'mark']);
            const gradeVal = getValue(['Grade', 'grade', 'Grades', 'grades']);

            if (email && name && subject) {
                const updateFields = {
                    studentEmail: email,
                    studentName: name,
                    rollNumber: rollNumber || 'N/A',
                    subject: subject,
                    uploadedBy: req.user.userId
                };

                if (attendanceVal !== null) {
                    updateFields.attendancePercentage = parseFloat(attendanceVal) || 0;
                    updateFields.hasAttendance = true;
                }
                if (marksVal !== null || gradeVal !== null) {
                    if (marksVal !== null) updateFields.marks = marksVal.toString();
                    if (gradeVal !== null) updateFields.grade = gradeVal.toString();
                    updateFields.hasMarks = true;
                }

                const existing = await Performance.findOne({ studentEmail: email, subject: subject });
                if (!existing) {
                    if (updateFields.attendancePercentage === undefined) updateFields.attendancePercentage = 0;
                    if (updateFields.marks === undefined) updateFields.marks = 'N/A';
                    if (updateFields.grade === undefined) updateFields.grade = 'N/A';
                }

                const updatedRecord = await Performance.findOneAndUpdate(
                    { studentEmail: email, subject: subject },
                    { $set: updateFields },
                    { upsert: true, new: true }
                );
                
                savedRecords.push(updatedRecord);

                // Add to grouping for consolidated email
                if (!studentGroups[email]) {
                    studentGroups[email] = { name: name, records: [] };
                }
                studentGroups[email].records.push(updatedRecord);
            }
        }

        // Send consolidated emails
        for (const email in studentGroups) {
            const { name, records } = studentGroups[email];
            await sendStudentPerformanceEmail(email, name, records);
        }

        fs.unlinkSync(filePath);
        res.status(200).json({
            message: 'File processed and notifications sent successfully',
            recordsCount: savedRecords.length
        });
    } catch (error) {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        res.status(500).json({ message: 'Error processing student data', error: error.message });
    }
};

// @route   GET /api/upload/performance/:email
// @desc    Get student performance data by email
// @access  Private (Student)
router.get('/performance/:email', protect, async (req, res) => {
    try {
        const { email } = req.params;
        
        // Students can only view their own data
        if (req.user.role === 'Student' && req.user.email !== email) {
            return res.status(403).json({ message: 'Access denied. You can only view your own performance data.' });
        }

        const performance = await Performance.find({ studentEmail: email });
        res.status(200).json(performance); // Return empty array if none found
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching performance', error: error.message });
    }
});

// @route   GET /api/upload/performance
// @desc    Get all student performance data
// @access  Private (Admin, Faculty)
router.get('/performance', protect, authorize('Admin', 'Faculty'), async (req, res) => {
    try {
        const performances = await Performance.find({});
        res.status(200).json(performances);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching all performance data', error: error.message });
    }
});

// @route   DELETE /api/upload/performance/:id
// @desc    Clear specific data (attendance or marks) or delete entire record
// @access  Private (Admin, Faculty)
router.delete('/performance/:id', protect, authorize('Admin', 'Faculty'), async (req, res) => {
    try {
        const { type } = req.query; // 'attendance' or 'marks'
        const record = await Performance.findById(req.params.id);
        
        if (!record) {
            return res.status(404).json({ message: 'Performance record not found' });
        }

        if (type === 'attendance') {
            record.hasAttendance = false;
            record.attendancePercentage = 0;
        } else if (type === 'marks') {
            record.hasMarks = false;
            record.marks = 'N/A';
            record.grade = 'N/A';
        } else {
            // No type specified, full delete
            await Performance.findByIdAndDelete(req.params.id);
            return res.status(200).json({ message: 'Performance record fully removed' });
        }

        // If both flags are now false, we can remove the entire doc
        if (!record.hasAttendance && !record.hasMarks) {
            await Performance.findByIdAndDelete(req.params.id);
            return res.status(200).json({ message: 'Record fully removed as it contained no more data' });
        }

        await record.save();
        res.status(200).json({ message: `${type.charAt(0).toUpperCase() + type.slice(1)} data cleared successfully` });
    } catch (error) {
        res.status(500).json({ message: 'Server error during deletion', error: error.message });
    }
});

module.exports = router;
