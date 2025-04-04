const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const Guard = require('../models/Guard');

// Load env vars
dotenv.config();

// Connect to DB
connectDB();

// Create admin user
const createAdmin = async () => {
  try {
    // First check if admin already exists
    const adminExists = await Guard.findOne({ email: 'behnam003@gmail.com' });
    
    if (adminExists) {
      console.log('ادمین با ایمیل behnam003@gmail.com از قبل وجود دارد.');
      process.exit(0);
    }
    
    const admin = await Guard.create({
      name: 'بهنام رحیمزاده',
      email: 'behnam003@gmail.com',
      password: '123456',
      phoneNumber: '09123456789',
      nationalId: '0012345678',
      role: 'admin',
      status: 'active'
    });

    console.log(`ادمین با ایمیل ${admin.email} و نقش ${admin.role} با موفقیت ایجاد شد.`);
    process.exit(0);
  } catch (err) {
    console.error('خطا در ایجاد کاربر ادمین:', err.message);
    process.exit(1);
  }
};

createAdmin(); 