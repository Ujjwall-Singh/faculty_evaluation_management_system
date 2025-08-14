const mongoose = require('mongoose');
const Faculty = require('./models/Faculty');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createTestFaculty() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Create test pending faculty
    const hashedPassword = await bcrypt.hash('TestPass123!', 12);
    
    const testFaculty = new Faculty({
      email: 'test.faculty@example.com',
      name: 'Dr. Test Faculty',
      department: 'Computer Science',
      subject: 'Data Structures',
      phone: '9876543210',
      password: hashedPassword,
      status: 'pending',
      isEmailVerified: true
    });

    await testFaculty.save();
    console.log('✅ Test pending faculty created for notification testing!');
    
    // Check total faculty count
    const allFaculty = await Faculty.find({});
    console.log(`Total faculty in database: ${allFaculty.length}`);
    
    const pendingFaculty = await Faculty.find({ status: 'pending' });
    console.log(`Pending faculty: ${pendingFaculty.length}`);

    mongoose.connection.close();
  } catch (error) {
    if (error.code === 11000) {
      console.log('Test faculty already exists');
    } else {
      console.error('Error:', error);
    }
    process.exit(0);
  }
}

createTestFaculty();
