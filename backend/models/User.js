const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['Admin', 'Faculty', 'Student'], required: true },
    phone: { type: String, default: '' },
    department: { type: String, default: '' },
    referenceId: { type: mongoose.Schema.Types.ObjectId, refPath: 'roleRef' }, // To map to Student or Faculty details
    roleRef: { type: String, enum: ['Student', 'Faculty'] } // Dynamic ref
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
