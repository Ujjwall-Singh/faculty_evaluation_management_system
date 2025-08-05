const mongoose = require('mongoose');
require('dotenv').config();

console.log('Fixing long admission numbers...');

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

const fixAdmissionNumbers = async () => {
  try {
    // Use direct collection access to avoid validation
    const studentsCol = mongoose.connection.db.collection('students');
    
    // Find all students with long admission numbers
    const longAdmissions = await studentsCol.find({
      $expr: { $gt: [{ $strLenCP: "$admissionNo" }, 15] }
    }).toArray();
    
    console.log(`Found ${longAdmissions.length} students with long admission numbers`);
    
    let fixedCount = 0;
    
    for (let student of longAdmissions) {
      // Create a new shorter temporary admission number
      const timestamp = Date.now().toString().slice(-8); // Last 8 digits of timestamp
      const randomStr = Math.random().toString(36).substr(2, 4).toUpperCase(); // 4 random chars
      const newAdmissionNo = `T${timestamp}${randomStr}`; // T + 8 digits + 4 chars = 13 chars total
      
      console.log(`Fixing: ${student.email}`);
      console.log(`  Old: ${student.admissionNo} (${student.admissionNo.length} chars)`);
      console.log(`  New: ${newAdmissionNo} (${newAdmissionNo.length} chars)`);
      
      await studentsCol.updateOne(
        { _id: student._id },
        { 
          $set: { 
            admissionNo: newAdmissionNo,
            lastUpdated: new Date()
          } 
        }
      );
      
      fixedCount++;
      
      // Small delay to ensure unique timestamps
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    console.log(`\n🎉 Fix completed successfully!`);
    console.log(`📊 Students with long admission numbers: ${longAdmissions.length}`);
    console.log(`🔄 Students fixed: ${fixedCount}`);
    
    // Verify the fix
    const remainingLong = await studentsCol.find({
      $expr: { $gt: [{ $strLenCP: "$admissionNo" }, 15] }
    }).toArray();
    
    console.log(`✅ Remaining long admission numbers: ${remainingLong.length}`);
    
  } catch (error) {
    console.error('Fix error:', error);
    throw error;
  }
};

const runFix = async () => {
  try {
    await connectDB();
    await fixAdmissionNumbers();
    console.log('\n✅ Admission number fix completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Fix failed:', error);
    process.exit(1);
  }
};

// Run the fix
runFix();
