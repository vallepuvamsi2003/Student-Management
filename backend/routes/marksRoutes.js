const express = require('express');
const router = express.Router();
const Marks = require('../models/Marks');
const Student = require('../models/Student');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/enter-marks', protect, authorize('Faculty', 'Admin'), async (req, res) => {
    const { studentId, courseId, assignmentMarks, midMarks, finalMarks, grade } = req.body;
    try {
        let marks = await Marks.findOne({ student: studentId, course: courseId });
        if (marks) {
            marks.assignmentMarks = assignmentMarks;
            marks.midMarks = midMarks;
            marks.finalMarks = finalMarks;
            marks.grade = grade;
            await marks.save();
        } else {
            marks = await Marks.create({
                student: studentId,
                course: courseId,
                assignmentMarks,
                midMarks,
                finalMarks,
                grade
            });
        }
        res.status(201).json(marks);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.post('/self-record', protect, authorize('Student', 'Faculty', 'Admin'), async (req, res) => {
    const { courseName: rawCourseName, assignmentMarks, midMarks, finalMarks, marksObtained, totalMarks, grade, studentEmail, studentName } = req.body;
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

        // Teacher/Admin can record for a specific student email
        if (studentEmail && (req.user.role === 'Faculty' || req.user.role === 'Admin')) {
            const targetUser = await User.findOne({ email: studentEmail });
            if (targetUser) {
                targetUserId = targetUser._id;
            } else {
                return res.status(404).json({ message: 'Target student not found' });
            }
        }

        let marks = await Marks.findOne({ student: targetUserId, course: course._id });

        if (marks) {
            marks.assignmentMarks = assignmentMarks;
            marks.midMarks = midMarks;
            marks.finalMarks = finalMarks;
            marks.marksObtained = marksObtained || 0;
            marks.totalMarks = totalMarks || 100;
            marks.grade = grade || 'N/A';
            await marks.save();
        } else {
            marks = await Marks.create({
                student: targetUserId,
                course: course._id,
                assignmentMarks,
                midMarks,
                finalMarks,
                marksObtained: marksObtained || 0,
                totalMarks: totalMarks || 100,
                grade: grade || 'N/A'
            });
        }
        res.status(201).json(marks);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.delete('/:id', protect, authorize('Student', 'Faculty', 'Admin'), async (req, res) => {
    try {
        await Marks.findByIdAndDelete(req.params.id);
        res.json({ message: 'Record removed' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/', protect, authorize('Faculty', 'Admin'), async (req, res) => {
    try {
        const marks = await Marks.find().populate('student', 'name rollNumber').populate('course', 'courseName courseCode');
        res.json(marks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/my-marks', protect, authorize('Student'), async (req, res) => {
    try {
        const marks = await Marks.find({ student: req.user.userId }).populate('course', 'courseName courseCode');
        res.json(marks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
