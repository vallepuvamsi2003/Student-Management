const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    description: { type: String },
    deadline: { type: Date, required: true },
    filePath: { type: String }, // For teacher's upload
    submissions: [{
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        solutionPath: { type: String },
        fileName: { type: String },
        submittedAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
