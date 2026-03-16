const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    rollNumber: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    course: { type: String, default: '' },
    department: { type: String, default: '' },
    branch: { type: String, default: '' },
    year: { type: Number, required: true },
    semester: { type: String, default: '1st Semester' },
    address: { type: String, default: '' },
    profileImage: { type: String, default: '' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // reference back to user account
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
