// Test script to regenerate verification token for the faculty
const mongoose = require('mongoose');
const Faculty = require('./models/Faculty');
const crypto = require('crypto');
require('dotenv').config();

async function regenerateVerificationToken() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find the faculty
    const faculty = await Faculty.findOne({ email: 'ujjwalraj95083@gmail.com' });
    
    if (!faculty) {
      console.log('Faculty not found');
      return;
    }

    console.log('Current faculty status:', {
      email: faculty.email,
      name: faculty.name,
      isEmailVerified: faculty.isEmailVerified,
      hasToken: !!faculty.emailVerificationToken,
      tokenExpires: faculty.emailVerificationExpires
    });

    // Generate new verification token
    const newToken = crypto.randomBytes(32).toString('hex');
    faculty.emailVerificationToken = newToken;
    faculty.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    faculty.isEmailVerified = false; // Reset to test verification
    
    await faculty.save();
    console.log('✅ New verification token generated!');

    console.log('New verification link:');
    console.log(`http://localhost:3000/verify-email?token=${newToken}&email=${encodeURIComponent(faculty.email)}`);

    console.log('Updated faculty status:', {
      email: faculty.email,
      name: faculty.name,
      isEmailVerified: faculty.isEmailVerified,
      newToken: newToken,
      tokenExpires: faculty.emailVerificationExpires
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

regenerateVerificationToken();
