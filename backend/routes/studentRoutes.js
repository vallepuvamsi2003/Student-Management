const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, async (req, res) => {
    try {
        const students = await Student.find();
        res.json(students);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/', protect, authorize('Admin'), async (req, res) => {
    const { name, rollNumber, email, phone, course, department, branch, year, semester, password } = req.body;
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create student reference
        const student = await Student.create({
            name, rollNumber, email, phone, course, department: department || '', branch: branch || '', year, semester: semester || ''
        });

        // Create user login
        const user = await User.create({
            name, email, password: hashedPassword, role: 'Student', referenceId: student._id, roleRef: 'Student', department: department || ''
        });

        student.user = user._id;
        await student.save();

        res.status(201).json(student);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.put('/:id', protect, authorize('Admin'), async (req, res) => {
    try {
        const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });

        // Update user as well to keep account data in sync
        if (student && student.user) {
            const updateData = {};
            if (req.body.name) updateData.name = req.body.name;
            if (req.body.email) updateData.email = req.body.email;
            if (req.body.phone) updateData.phone = req.body.phone;
            if (req.body.department) updateData.department = req.body.department;

            if (Object.keys(updateData).length > 0) {
                await User.findByIdAndUpdate(student.user, updateData);
            }
        }

        res.json(student);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.delete('/:id', protect, authorize('Admin'), async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) return res.status(404).json({ message: 'Student not found' });

        await User.findByIdAndDelete(student.user);
        await Student.findByIdAndDelete(req.params.id);

        res.json({ message: 'Student removed' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/profile', protect, authorize('Student', 'Faculty', 'Admin'), async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) return res.status(404).json({ message: 'User account not found' });

        const studentProfile = await Student.findById(user.referenceId);
        
        // Merge data: User document is the source of truth for name/email/role
        // Student document is the source of truth for academic year/semester/branch
        const mergedProfile = {
            ...(studentProfile ? studentProfile.toObject() : {}),
            name: user.name,
            email: user.email,
            phone: user.phone || (studentProfile ? studentProfile.phone : ''),
            department: user.department || (studentProfile ? studentProfile.department : ''),
            role: user.role,
            _id: user._id, // User ID for account reference
            profileId: studentProfile ? studentProfile._id : null
        };

        res.json(mergedProfile);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/profile', protect, authorize('Student', 'Faculty', 'Admin'), async (req, res) => {
    try {
        const { name, email, phone, profileImage, department, year, semester } = req.body;
        const user = await User.findById(req.user.userId);
        const student = await Student.findById(user.referenceId);

        if (!student) return res.status(404).json({ message: 'Profile record not found' });

        // Update Student Profile Attributes
        if (name) student.name = name;
        if (email) student.email = email;
        if (phone) student.phone = phone;
        if (profileImage !== undefined) student.profileImage = profileImage;
        if (department) student.department = department;
        if (year) student.year = year;
        if (semester) student.semester = semester;
        await student.save();

        // Sync with User Account to maintain consistent data
        const userUpdateData = {};
        if (name) userUpdateData.name = name;
        if (email) userUpdateData.email = email;
        if (phone) userUpdateData.phone = phone;
        if (department) userUpdateData.department = department;

        if (Object.keys(userUpdateData).length > 0) {
            await User.findByIdAndUpdate(req.user.userId, userUpdateData);
        }

        // Return merged data logic similar to GET /profile
        const updatedUser = await User.findById(req.user.userId).select('-password');
        const mergedProfile = {
            ...student.toObject(),
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            department: updatedUser.department,
            role: updatedUser.role
        };

        res.json(mergedProfile);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
