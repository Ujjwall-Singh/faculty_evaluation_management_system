const mongoose = require('mongoose');
const Student = require('./models/Student');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/Faculty_Evaluation', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const testStudents = async () => {
  try {
    console.log('Testing student connection...');
    
    // Check how many students exist
    const studentCount = await Student.countDocuments();
    console.log('Total students in database:', studentCount);
    
    if (studentCount > 0) {
      // Get first 5 students to see data structure
      const students = await Student.find().limit(5).select('-password');
      console.log('\nFirst 5 students:');
      students.forEach((student, index) => {
        console.log(`\nStudent ${index + 1}:`);
        console.log('Name:', student.fullName || student.username);
        console.log('Admission No:', student.admissionNo);
        console.log('Email:', student.email);
        console.log('Department:', student.department);
        console.log('Semester:', student.semester);
        console.log('Section:', student.section);
      });
      
      // Test query by admission number
      if (students.length > 0 && students[0].admissionNo) {
        console.log('\n--- Testing query by admission number ---');
        const testAdmissionNo = students[0].admissionNo;
        const queryResult = await Student.find({ 
          admissionNo: { $regex: testAdmissionNo, $options: 'i' } 
        }).select('-password');
        
        console.log(`Query for admission number "${testAdmissionNo}":`, queryResult.length, 'results');
        if (queryResult.length > 0) {
          const student = queryResult[0];
          console.log('Result:', {
            name: student.fullName || student.username,
            admissionNo: student.admissionNo,
            department: student.department,
            semester: student.semester,
            section: student.section
          });
        }
      }
    } else {
      console.log('No students found in database');
    }
    
  } catch (error) {
    console.error('Error testing students:', error);
  } finally {
    mongoose.connection.close();
  }
};

testStudents();
