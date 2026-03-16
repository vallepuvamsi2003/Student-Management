const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/fileUpload');

router.get('/', protect, async (req, res) => {
    try {
        const assignments = await Assignment.find().populate('course', 'courseName courseCode');
        res.json(assignments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/', protect, authorize('Faculty', 'Admin'), upload.single('file'), async (req, res) => {
    const { title, courseName: rawCourseName, description, deadline } = req.body;
    const courseName = rawCourseName?.trim();
    const filePath = req.file ? req.file.path : req.body.filePath;

    try {
        const Course = require('../models/Course');
        let course = await Course.findOne({ courseName });
        if (!course) {
            course = await Course.create({
                courseName,
                courseCode: courseName.substring(0, 5).toUpperCase(),
                department: 'General',
                facultyAssigned: req.user.userId
            });
        }

        const assignment = await Assignment.create({
            title,
            course: course._id,
            description,
            deadline,
            filePath // Store the path of the uploaded file
        });
        res.status(201).json(assignment);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.post('/submit/:id', protect, authorize('Student'), upload.single('file'), async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);
        if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

        const solutionPath = req.file ? req.file.path : req.body.solutionPath;

        assignment.submissions.push({
            student: req.user.userId,
            solutionPath: solutionPath,
            fileName: req.file ? req.file.originalname : req.body.fileName
        });
        await assignment.save();
        res.json({ message: 'Submitted successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.delete('/:id', protect, authorize('Faculty', 'Admin'), async (req, res) => {
    try {
        await Assignment.findByIdAndDelete(req.params.id);
        res.json({ message: 'Assignment removed' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
