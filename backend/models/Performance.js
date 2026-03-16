const mongoose = require('mongoose');

const performanceSchema = new mongoose.Schema({
    studentEmail: { type: String, required: true },
    studentName: { type: String, required: true },
    rollNumber: { type: String, required: true },
    subject: { type: String, required: true },
    attendancePercentage: { type: Number, required: true },
    marks: { type: String, required: true },
    grade: { type: String, required: true },
    hasAttendance: { type: Boolean, default: false },
    hasMarks: { type: Boolean, default: false },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Performance', performanceSchema);
