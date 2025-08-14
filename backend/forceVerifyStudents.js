const mongoose = require('mongoose');
const Student = require('./models/Student');
require('dotenv').config();

async function verifyAllStudents() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Force verify all students
    console.log('\n=== Verifying ALL students for testing ===');
    const result = await Student.updateMany(
      {}, // Update all students
      { 
        $set: {
          isEmailVerified: true,
          emailVerificationToken: null,
          emailVerificationExpires: null
        }
      }
    );
    console.log(`Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);
    
    // Check updated results
    const verifiedStudents = await Student.find(
      { isEmailVerified: true }, 
      'email name isEmailVerified'
    );
    console.log(`\n=== Now ${verifiedStudents.length} students are verified ===`);
    
    if (verifiedStudents.length < 10) {
      verifiedStudents.forEach((student, index) => {
        console.log(`${index + 1}. ${student.name} (${student.email}) - Verified: YES`);
      });
    } else {
      console.log('First 5 verified students:');
      verifiedStudents.slice(0, 5).forEach((student, index) => {
        console.log(`${index + 1}. ${student.name} (${student.email}) - Verified: YES`);
      });
      console.log(`... and ${verifiedStudents.length - 5} more`);
    }

    mongoose.connection.close();
    console.log('\n✅ All students are now verified for testing!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

verifyAllStudents();
