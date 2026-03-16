const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    date: { type: Date, required: true },
    records: [{
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        status: { type: String, enum: ['Present', 'Absent'], required: true }
    }],
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Faculty who marked
}, { timestamps: true });

// Ensure unique attendance per course per day
attendanceSchema.index({ course: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
