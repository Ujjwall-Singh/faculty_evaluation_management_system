// Quick script to approve faculty for testing
const mongoose = require('mongoose');
const Faculty = require('./models/Faculty');
require('dotenv').config();

async function approveFaculty() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find and approve the faculty
    const faculty = await Faculty.findOne({ email: 'ujjwalraj95083@gmail.com' });
    
    if (!faculty) {
      console.log('Faculty not found');
      return;
    }

    console.log('Current faculty status:', {
      email: faculty.email,
      name: faculty.name,
      status: faculty.status,
      isEmailVerified: faculty.isEmailVerified
    });

    // Approve and verify
    faculty.status = 'approved';
    faculty.approvalStatus = 'approved';
    faculty.isEmailVerified = true;
    faculty.approvedAt = new Date();
    
    await faculty.save();
    console.log('✅ Faculty approved and email verified!');

    // Verify the changes
    const updatedFaculty = await Faculty.findOne({ email: 'ujjwalraj95083@gmail.com' });
    console.log('Updated faculty status:', {
      email: updatedFaculty.email,
      name: updatedFaculty.name,
      status: updatedFaculty.status,
      approvalStatus: updatedFaculty.approvalStatus,
      isEmailVerified: updatedFaculty.isEmailVerified,
      approvedAt: updatedFaculty.approvedAt
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

approveFaculty();
