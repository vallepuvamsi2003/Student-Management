const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
    title: { type: String, required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    type: { type: String, enum: ['PDF', 'PPT', 'Video', 'Note', 'Folder'], required: true },
    filePath: { type: String },
    isFolder: { type: Boolean, default: false },
    files: [{
        name: { type: String },
        path: { type: String }
    }],
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Material', materialSchema);
