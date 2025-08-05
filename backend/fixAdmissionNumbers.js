const mongoose = require('mongoose');
require('dotenv').config();

console.log('Starting admission number fix...');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Get existing Student model without strict validation
const StudentFix = mongoose.model('StudentFix', new mongoose.Schema({}, { strict: false }));

const fixAdmissionNumbers = async () => {
  try {
    console.log('Fetching students with long admission numbers...');
    
    // Find all students with admission numbers longer than 15 characters
    const studentsToFix = await StudentFix.find({
      admissionNo: { $regex: /^.{16,}$/ } // More than 15 characters
    });
    
    console.log(`Found ${studentsToFix.length} students with long admission numbers`);
    
    let fixedCount = 0;
    
    for (let student of studentsToFix) {
      // Create a new shorter temporary admission number
      const timestamp = Date.now().toString().slice(-8); // Last 8 digits of timestamp
      const randomStr = Math.random().toString(36).substr(2, 4).toUpperCase(); // 4 random chars
      const newAdmissionNo = `T${timestamp}${randomStr}`; // T + 8 digits + 4 chars = 13 chars total
      
      console.log(`Fixing: ${student.email} - Old: ${student.admissionNo} -> New: ${newAdmissionNo}`);
      
      await StudentFix.updateOne(
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
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    console.log(`\n🎉 Fix completed successfully!`);
    console.log(`📊 Students found with long admission numbers: ${studentsToFix.length}`);
    console.log(`🔄 Students fixed: ${fixedCount}`);
    
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
