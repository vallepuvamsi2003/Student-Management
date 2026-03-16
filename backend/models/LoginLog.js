const mongoose = require('mongoose');

const loginLogSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    email: { type: String, required: true },
    role: { type: String, required: true },
    loginTime: { type: Date, default: Date.now },
    ipAddress: { type: String },
    status: { type: String, default: 'Success' },
    userAgent: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('LoginLog', loginLogSchema);
