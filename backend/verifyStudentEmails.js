const mongoose = require('mongoose');
const Student = require('./models/Student');
require('dotenv').config();

async function checkAndVerifyStudent() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find all students
    const students = await Student.find({}, 'email name isEmailVerified admissionNo universityRollNo');
    console.log('\n=== All Students ===');
    students.forEach((student, index) => {
      console.log(`${index + 1}. ${student.name} (${student.email})`);
      console.log(`   Admission: ${student.admissionNo}, Roll: ${student.universityRollNo}`);
      console.log(`   Email Verified: ${student.isEmailVerified ? 'YES' : 'NO'}`);
      console.log('');
    });

    // Auto-verify all students for testing (temporary fix)
    if (students.length > 0) {
      console.log('\n=== Auto-verifying all students for testing ===');
      const result = await Student.updateMany(
        { isEmailVerified: false },
        { 
          isEmailVerified: true,
          emailVerificationToken: null,
          emailVerificationExpires: null
        }
      );
      console.log(`Updated ${result.modifiedCount} students`);
      
      console.log('\n=== Updated Student Status ===');
      const updatedStudents = await Student.find({}, 'email name isEmailVerified');
      updatedStudents.forEach((student, index) => {
        console.log(`${index + 1}. ${student.name} (${student.email}) - Verified: ${student.isEmailVerified ? 'YES' : 'NO'}`);
      });
    }

    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkAndVerifyStudent();
