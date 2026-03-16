const express = require('express');
const router = express.Router();
const Material = require('../models/Material');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/fileUpload');

router.get('/', protect, async (req, res) => {
    try {
        const materials = await Material.find().populate('course', 'courseName courseCode');
        res.json(materials);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/', protect, authorize('Faculty', 'Admin'), (req, res, next) => {
    upload.array('file')(req, res, (err) => {
        if (err instanceof require('multer').MulterError) {
            return res.status(400).json({ message: `Upload Error: ${err.message}. If uploading a folder, ensure total size is under 200MB.` });
        } else if (err) {
            return res.status(500).json({ message: `Server Error: ${err.message}` });
        }
        next();
    });
}, async (req, res) => {
    const { title, courseName: rawCourseName, type } = req.body;
    const courseName = rawCourseName?.trim();
    
    // Check if it's a folder upload (multiple files)
    const files = req.files || [];
    const isFolder = files.length > 1 || type === 'Folder';
    
    let filePath = '';
    let subFiles = [];

    if (files.length === 1 && !isFolder) {
        filePath = files[0].filename;
    } else if (files.length > 0) {
        subFiles = files.map(f => ({
            name: f.originalname,
            path: f.filename
        }));
    }

    console.log(`Processing ${files.length} files for material: "${title}"`);

    try {
        const Course = require('../models/Course');
        const generatedCode = courseName.substring(0, 5).toUpperCase();
        
        // Find existing course case-insensitively by name OR by generated code
        let course = await Course.findOne({
            $or: [
                { courseName: { $regex: new RegExp(`^${courseName}$`, 'i') } },
                { courseCode: generatedCode }
            ]
        });

        if (!course) {
            console.log(`Course "${courseName}" or Code "${generatedCode}" not found, creating new one...`);
            course = await Course.create({
                courseName,
                courseCode: generatedCode,
                department: 'General',
                facultyAssigned: req.user.userId
            });
        }

        console.log(`Storing material data in MongoDB for course: ${course.courseName}`);
        const material = await Material.create({
            title,
            course: course._id,
            type: isFolder ? 'Folder' : type,
            filePath: filePath,
            isFolder: isFolder,
            files: subFiles,
            uploadedBy: req.user.userId
        });
        
        console.log(`Successfully created Material record: ${material._id}`);
        res.status(201).json(material);
    } catch (err) {
        console.error('Database Error storing material:', err);
        res.status(400).json({ message: err.message });
    }
});

router.delete('/:id', protect, authorize('Faculty', 'Admin'), async (req, res) => {
    try {
        await Material.findByIdAndDelete(req.params.id);
        res.json({ message: 'Material removed' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
