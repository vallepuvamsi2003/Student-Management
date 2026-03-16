const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    courseName: { type: String, required: true },
    courseCode: { type: String, required: true, unique: true },
    department: { type: String, required: true },
    credits: { type: Number, default: 3 },
    semester: { type: String, default: '1st Semester' },
    instructor: { type: String, default: 'General Faculty' },
    schedule: { type: String, default: 'TBD' },
    facultyAssigned: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Ref to Faculty
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
