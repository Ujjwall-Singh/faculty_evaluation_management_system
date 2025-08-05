const mongoose = require('mongoose');
require('dotenv').config();

console.log('Checking database collections...');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const checkCollections = async () => {
  try {
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nAvailable collections:');
    collections.forEach(col => {
      console.log(`  - ${col.name}`);
    });
    
    // Check students collection specifically
    const studentsCol = mongoose.connection.db.collection('students');
    const studentCount = await studentsCol.countDocuments();
    console.log(`\nStudents collection count: ${studentCount}`);
    
    if (studentCount > 0) {
      // Get a few sample documents
      const samples = await studentsCol.find({}).limit(5).toArray();
      console.log('\nSample students:');
      samples.forEach(student => {
        console.log(`  ${student.email}: admission=${student.admissionNo} (${student.admissionNo?.length || 0} chars)`);
      });
      
      // Check for long admission numbers
      const longAdmissions = await studentsCol.find({
        $expr: { $gt: [{ $strLenCP: "$admissionNo" }, 15] }
      }).toArray();
      
      console.log(`\nStudents with long admission numbers: ${longAdmissions.length}`);
      if (longAdmissions.length > 0) {
        longAdmissions.forEach(student => {
          console.log(`  ${student.email}: ${student.admissionNo} (${student.admissionNo.length} chars)`);
        });
      }
    }
    
  } catch (error) {
    console.error('Check error:', error);
    throw error;
  }
};

const runCheck = async () => {
  try {
    await connectDB();
    await checkCollections();
    console.log('\n✅ Collection check completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Check failed:', error);
    process.exit(1);
  }
};

// Run the check
runCheck();
