const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Student = require('../models/Student');
const bcrypt = require('bcryptjs');
const LoginLog = require('../models/LoginLog');
const { sendAdminSignupConfirmation } = require('../utils/emailService');

const ensureStudentProfile = async (user) => {
    if (!user.referenceId) {
        // Try to find existing student before creating
        let student = await Student.findOne({ email: user.email });

        if (!student) {
            const prefix = user.role === 'Faculty' ? 'FAC-' : user.role === 'Admin' ? 'ADM-' : 'NEW-';
            student = await Student.create({
                name: user.name,
                email: user.email,
                rollNumber: prefix + Math.floor(Math.random() * 10000),
                phone: 'Not Provided',
                year: 1,
                user: user._id
            });
        } else {
            // Update student with user link if missing
            if (!student.user) {
                student.user = user._id;
                await student.save();
            }
        }

        user.referenceId = student._id;
        await user.save();
    }
};

router.post('/login', async (req, res) => {
    const { email, password, role } = req.body;
    try {
        let user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: 'User not found. Please contact Administrator.' });
        }

        if (role && user.role !== role) {
            return res.status(401).json({ message: 'Incorrect role selection' });
        }

        if (user && (await bcrypt.compare(password, user.password))) {
            await ensureStudentProfile(user);

            // 1. Log the activity 
            await LoginLog.create({
                user: user._id,
                email: user.email,
                role: user.role,
                ipAddress: req.ip || req.headers['x-forwarded-for'] || 'Internal',
                status: 'Success',
                userAgent: req.headers['user-agent']
            });

            // 2. Email alert removed as per new requirements

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                referenceId: user.referenceId,
                token: user._id
            });
        } else {
            // Log failure if user exists but password mismatch
            if (user) {
                await LoginLog.create({
                    user: user._id,
                    email: user.email,
                    role: user.role,
                    ipAddress: req.ip,
                    status: 'Failed: Password Mismatch'
                });
            }
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Mock Google Auth logic - In production replace with real OAuth verifier
router.post('/google', async (req, res) => {
    const { email, name } = req.body;
    try {
        let user = await User.findOne({ email });

        // Auto-provision user if they do not exist
        if (!user) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(email + Date.now().toString(), salt); // dummy password

            // By default, let's provision as Student to prevent admin abuse
            user = await User.create({
                name: name || email.split('@')[0],
                email,
                password: hashedPassword,
                role: 'Student',
                roleRef: 'Student'
            });
        }

        await ensureStudentProfile(user);

        // 1. Log the activity 
        await LoginLog.create({
            user: user._id,
            email: user.email,
            role: user.role,
            ipAddress: req.ip || 'External Provider',
            status: 'Success (Google)',
            userAgent: req.headers['user-agent']
        });

        // 2. Email alert removed as per new requirements

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            referenceId: user.referenceId,
            token: user._id // Replacing JWT with pure User ID tracking 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/register-admin', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name, email, password: hashedPassword, role: 'Admin'
        });

        // Send confirmation email
        sendAdminSignupConfirmation(email, name);

        res.status(201).json({ message: 'Admin created successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Admin adds faculty
router.post('/add-faculty', require('../middleware/authMiddleware').protect, require('../middleware/authMiddleware').authorize('Admin'), async (req, res) => {
    const { name, email, password, phone, department } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name, email, password: hashedPassword, role: 'Faculty', roleRef: 'Faculty',
            phone: phone || '', department: department || ''
        });

        // Create a Student-like profile record for the faculty so their profile page works
        const existingProfile = await Student.findOne({ email });
        if (!existingProfile) {
            const profile = await Student.create({
                name,
                email,
                rollNumber: 'FAC-' + Math.floor(1000 + Math.random() * 9000),
                phone: phone || 'Not Provided',
                department: department || 'General',
                year: 1,
                semester: '1st Sem',
                user: user._id
            });
            user.referenceId = profile._id;
            await user.save();
        }

        res.status(201).json({ message: 'Faculty created successfully', user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put('/faculty/:id', require('../middleware/authMiddleware').protect, require('../middleware/authMiddleware').authorize('Admin'), async (req, res) => {
    try {
        const { name, email, phone, department, password } = req.body;
        const user = await User.findById(req.params.id);
        
        if (!user) return res.status(404).json({ message: 'Faculty not found' });

        if (name) user.name = name;
        if (email) user.email = email;
        if (phone !== undefined) user.phone = phone;
        if (department !== undefined) user.department = department;

        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        await user.save();

        // Update linked profile if it exists
        if (user.referenceId) {
            await Student.findByIdAndUpdate(user.referenceId, {
                name: user.name,
                email: user.email,
                phone: user.phone,
                department: user.department
            });
        }

        res.json({ message: 'Faculty updated successfully', user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
router.get('/faculty-list', require('../middleware/authMiddleware').protect, require('../middleware/authMiddleware').authorize('Admin'), async (req, res) => {
    try {
        const faculty = await User.find({ role: 'Faculty' }).select('-password');
        res.json(faculty);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete('/faculty/:id', require('../middleware/authMiddleware').protect, require('../middleware/authMiddleware').authorize('Admin'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user && user.referenceId) {
            await Student.findByIdAndDelete(user.referenceId);
        }
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'Faculty removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/signup', async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        // ONLY Admin is allowed to sign up via this route now
        if (role !== 'Admin') {
            return res.status(403).json({ message: 'Only Admin accounts can be created via sign up. Please contact your administrator.' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'Account with this email already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create Admin account
        const user = await User.create({
            name, email, password: hashedPassword, role: 'Admin'
        });

        // Send confirmation email
        sendAdminSignupConfirmation(email, name);

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: user._id
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get current logged-in user profile (for Admin viewing their own profile)
router.get('/profile/me', require('../middleware/authMiddleware').protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update current logged-in user profile (for Admin)
router.put('/profile/me', require('../middleware/authMiddleware').protect, async (req, res) => {
    try {
        const { name, email, phone } = req.body;
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (name) user.name = name;
        if (email) user.email = email;
        if (phone !== undefined) user.phone = phone;

        await user.save();
        const updated = await User.findById(req.user.userId).select('-password');
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
