require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('Connected to MongoDB');
        const existing = await User.findOne({ email: 'admin@sms.com' });
        if (!existing) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('admin123', salt);
            await User.create({
                name: 'System Admin',
                email: 'admin@sms.com',
                password: hashedPassword,
                role: 'Admin'
            });
            console.log('Admin user created (admin@sms.com / admin123)');
        } else {
            console.log('Admin already exists.');
        }
        mongoose.connection.close();
    })
    .catch(err => console.error(err));
