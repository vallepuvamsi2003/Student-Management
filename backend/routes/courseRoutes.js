const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, async (req, res) => {
    try {
        const courses = await Course.find().populate('facultyAssigned', 'name email');
        res.json(courses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/', protect, authorize('Admin', 'Student', 'Faculty'), async (req, res) => {
    try {
        const payload = { ...req.body };
        // If Faculty creates, assign them. If Admin, maybe too.
        if (req.user.role === 'Faculty') payload.facultyAssigned = req.user.userId;

        const course = await Course.create(payload);
        res.status(201).json(course);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.delete('/:id', protect, authorize('Admin', 'Student', 'Faculty'), async (req, res) => {
    try {
        await Course.findByIdAndDelete(req.params.id);
        res.json({ message: 'Course removed' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/:id', protect, authorize('Admin', 'Student', 'Faculty'), async (req, res) => {
    try {
        const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(course);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.get('/my-courses', protect, authorize('Faculty', 'Student'), async (req, res) => {
    try {
        if (req.user.role === 'Faculty') {
            const courses = await Course.find({ facultyAssigned: req.user.userId }).populate('facultyAssigned', 'name email');
            res.json(courses);
        } else if (req.user.role === 'Student') {
            const StudentModel = require('../models/Student');
            const student = await StudentModel.findById(req.user.referenceId).populate({
                path: 'course',
                populate: { path: 'facultyAssigned', select: 'name email' }
            });

            // Return array of courses; our system only maps 1 course to a student currently
            res.json(student && student.course ? [student.course] : []);
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
