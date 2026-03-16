const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('Faculty', 'Admin'), async (req, res) => {
    try {
        const attendance = await Attendance.find()
            .populate('course', 'courseName courseCode')
            .populate('records.student', 'name email');

        // Flatten sessions into individual student rows for the log table
        const result = [];
        attendance.forEach(session => {
            session.records.forEach(studentRecord => {
                result.push({
                    _id: session._id,
                    date: session.date,
                    course: session.course,
                    status: studentRecord.status,
                    student: studentRecord.student
                });
            });
        });

        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/mark', protect, authorize('Faculty', 'Admin'), async (req, res) => {
    const { date, courseId, students } = req.body; // students: [{ studentId: '...', status: 'Present' }]
    try {
        let attendance = await Attendance.findOne({ course: courseId, date });

        const formattedRecords = students.map(s => ({
            student: s.studentId,
            status: s.status
        }));

        if (attendance) {
            attendance.records = formattedRecords;
            attendance.faculty = req.user.userId;
            await attendance.save();
        } else {
            attendance = await Attendance.create({
                course: courseId,
                date,
                records: formattedRecords,
                faculty: req.user.userId
            });
        }
        res.status(201).json(attendance);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.post('/self-record', protect, authorize('Student', 'Faculty', 'Admin'), async (req, res) => {
    const { date, courseName: rawCourseName, status, studentEmail, studentName } = req.body;
    const courseName = rawCourseName?.trim();
    try {
        const Course = require('../models/Course');
        let course = await Course.findOne({ courseName });
        if (!course) {
            course = await Course.create({
                courseName,
                courseCode: courseName.substring(0, 5).toUpperCase() + Math.floor(Math.random() * 100),
                department: 'General',
                facultyAssigned: req.user.userId
            });
        }

        let targetUserId = req.user.userId;

        // If a Teacher/Admin provides a student email, find that student
        if (studentEmail && (req.user.role === 'Faculty' || req.user.role === 'Admin')) {
            const targetUser = await User.findOne({ email: studentEmail });
            if (targetUser) {
                targetUserId = targetUser._id;
            } else {
                return res.status(404).json({ message: 'Target student not found' });
            }
        }

        let attendance = await Attendance.findOne({ course: course._id, date });

        if (attendance) {
            const existingIdx = attendance.records.findIndex(r => r.student.toString() === targetUserId.toString());
            if (existingIdx > -1) {
                attendance.records[existingIdx].status = status;
            } else {
                attendance.records.push({ student: targetUserId, status });
            }
            await attendance.save();
        } else {
            attendance = await Attendance.create({
                course: course._id,
                date,
                records: [{ student: targetUserId, status }]
            });
        }
        res.status(201).json(attendance);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.delete('/:id', protect, authorize('Student', 'Faculty', 'Admin'), async (req, res) => {
    try {
        await Attendance.findByIdAndDelete(req.params.id);
        res.json({ message: 'Attendance record removed' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/my-attendance', protect, authorize('Student'), async (req, res) => {
    try {
        const attendance = await Attendance.find({ 'records.student': req.user.userId }).populate('course', 'courseName courseCode');

        const result = attendance.map(a => {
            const record = a.records.find(r => r.student.toString() === req.user.userId.toString());
            return {
                _id: a._id,
                date: a.date,
                course: a.course,
                status: record ? record.status : 'Absent'
            };
        });

        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
