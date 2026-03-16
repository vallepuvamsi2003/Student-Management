const mongoose = require('mongoose');

const marksSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    assignmentMarks: { type: Number, default: 0 },
    midMarks: { type: Number, default: 0 },
    finalMarks: { type: Number, default: 0 },
    marksObtained: { type: Number, default: 0 },
    totalMarks: { type: Number, default: 100 },
    grade: { type: String, default: 'N/A' }
}, { timestamps: true });

// A student has one mark record per course
marksSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Marks', marksSchema);
