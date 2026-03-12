const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const mongoURI = 'mongodb://127.0.0.1:27017/smart-dashboard';

async function seed() {
    try {
        await mongoose.connect(mongoURI);
        console.log('Connected to DB');

        const count = await User.countDocuments();
        console.log('Current count:', count);

        const adminData = {
            name: 'Admin User',
            email: 'admin@dashboard.com',
            password: 'password123',
            role: 'Admin',
            isVerified: true
        };

        console.log('Attempting to seed admin...');
        const admin = new User(adminData);
        await admin.save();
        console.log('Seed success!');

        process.exit(0);
    } catch (err) {
        console.error('Seed FAILED:');
        console.error(err);
        if (err.errors) {
            console.error('Validation errors:', JSON.stringify(err.errors, null, 2));
        }
        process.exit(1);
    }
}

seed();
