const mongoose = require('mongoose');
require('dotenv').config();

console.log('Checking admission number lengths...');

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

// Get existing Student model without strict validation
const StudentCheck = mongoose.model('StudentCheck', new mongoose.Schema({}, { strict: false }));

const checkAdmissionNumbers = async () => {
  try {
    console.log('Checking all admission numbers...');
    
    // Find all students and check their admission numbers
    const students = await StudentCheck.find({});
    
    console.log(`Found ${students.length} total students`);
    
    const longAdmissions = [];
    const tempAdmissions = [];
    
    for (let student of students) {
      if (student.admissionNo) {
        const length = student.admissionNo.length;
        
        if (length > 15) {
          longAdmissions.push({
            email: student.email,
            admissionNo: student.admissionNo,
            length: length
          });
        }
        
        if (student.admissionNo.startsWith('TEMP') || student.admissionNo.startsWith('T')) {
          tempAdmissions.push({
            email: student.email,
            admissionNo: student.admissionNo,
            length: length
          });
        }
      }
    }
    
    console.log(`\n📊 Results:`);
    console.log(`Long admission numbers (>15 chars): ${longAdmissions.length}`);
    console.log(`Temporary admission numbers: ${tempAdmissions.length}`);
    
    if (longAdmissions.length > 0) {
      console.log(`\n❌ Long admission numbers found:`);
      longAdmissions.forEach(s => {
        console.log(`  ${s.email}: ${s.admissionNo} (${s.length} chars)`);
      });
    }
    
    if (tempAdmissions.length > 0) {
      console.log(`\n🔍 All temporary admission numbers:`);
      tempAdmissions.slice(0, 10).forEach(s => {
        console.log(`  ${s.email}: ${s.admissionNo} (${s.length} chars)`);
      });
      if (tempAdmissions.length > 10) {
        console.log(`  ... and ${tempAdmissions.length - 10} more`);
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
    await checkAdmissionNumbers();
    console.log('\n✅ Check completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Check failed:', error);
    process.exit(1);
  }
};

// Run the check
runCheck();
