// Check current faculty status in database
const mongoose = require('mongoose');
const Faculty = require('./models/Faculty');
require('dotenv').config();

async function checkFacultyStatus() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const faculty = await Faculty.findOne({ email: 'ujjwalraj95083@gmail.com' });
    
    if (!faculty) {
      console.log('❌ Faculty not found');
      return;
    }

    console.log('📋 Current Faculty Status:');
    console.log('================================');
    console.log('Email:', faculty.email);
    console.log('Name:', faculty.name);
    console.log('Is Email Verified:', faculty.isEmailVerified);
    console.log('Verification Token:', faculty.emailVerificationToken);
    console.log('Token Expires:', faculty.emailVerificationExpires);
    console.log('Current Time:', new Date());
    console.log('Token Expired:', faculty.emailVerificationExpires < new Date());
    console.log('Status:', faculty.status || faculty.approvalStatus);
    console.log('================================');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

checkFacultyStatus();
