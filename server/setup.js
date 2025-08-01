const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const setupDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/airport-vendor-system');
    console.log('Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = new User({
      name: 'System Administrator',
      email: 'admin@airport.com',
      password: hashedPassword,
      role: 'admin',
      permissions: ['view_all_vendors', 'view_all_shops', 'view_all_transactions', 'generate_reports', 'approve_vendors']
    });

    await admin.save();
    console.log('Admin user created successfully');
    console.log('Email: admin@airport.com');
    console.log('Password: admin123');

  } catch (error) {
    console.error('Setup error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Database setup completed');
  }
};

setupDatabase(); 