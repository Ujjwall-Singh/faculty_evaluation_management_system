// routes/signup.js
const express = require('express');
const bcrypt = require('bcryptjs'); // Use bcryptjs consistently
const mongoose = require('mongoose');
const router = express.Router();
const Faculty = require('../models/Faculty');
const Student = require('../models/Student');

router.post('/', async (req, res) => {
  const { 
    email, 
    name, 
    password, 
    role, 
    department, 
    subject, 
    phone,
    // Student-specific fields
    admissionNo,
    universityRollNo,
    semester,
    section,
    dateOfBirth,
    phoneNumber,
    course,
    batch,
    address,
    guardianInfo
  } = req.body;

  console.log('Signup request received:', { 
    email, 
    name, 
    role, 
    department, 
    subject, 
    phone: phone ? 'provided' : 'not provided',
    admissionNo,
    universityRollNo,
    semester,
    section
  });

  // Check database connection and try to reconnect if needed
  if (mongoose.connection.readyState !== 1) {
    console.log('Database not connected, attempting to reconnect...');
    try {
      const options = {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        minPoolSize: 5,
      };
      await mongoose.connect(process.env.MONGO_URI, options);
      console.log('Database reconnected successfully');
    } catch (err) {
      console.error('Failed to reconnect to database:', err.message);
      return res.status(500).json({ error: 'Database connection failed', details: err.message });
    }
  }

  try {
    // Validate required fields based on role
    if (role === 'Faculty') {
      if (!email || !name || !password || !department || !subject || !phone) {
        console.log('Faculty validation failed - missing fields');
        return res.status(400).json({ 
          error: 'All fields are required for faculty signup: email, name, password, department, subject, phone' 
        });
      }
    } else if (role === 'Student') {
      if (!email || !name || !password || !admissionNo || !universityRollNo || !semester || !section) {
        console.log('Student validation failed - missing fields');
        return res.status(400).json({ 
          error: 'Required fields for student signup: email, name, password, admission number, university roll number, semester, section' 
        });
      }

      // Additional validation for student-specific fields
      if (admissionNo && !/^[A-Z0-9]{8,15}$/.test(admissionNo)) {
        return res.status(400).json({
          error: 'Admission number must be 8-15 alphanumeric characters'
        });
      }

      if (universityRollNo && !/^\d{6,25}$/.test(universityRollNo)) {
        return res.status(400).json({
          error: 'University roll number must be 6-25 digits'
        });
      }

      if (!['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'].includes(semester)) {
        return res.status(400).json({
          error: 'Semester must be between 1st and 8th'
        });
      }

      if (!['Section A', 'Section B', 'Section C', 'Section D', 'Section E', 'Super60', 'Uniques'].includes(section)) {
        return res.status(400).json({
          error: 'Section must be one of: Section A, Section B, Section C, Section D, Section E, Super60, or Uniques'
        });
      }

      // Check for duplicate admission number and university roll number
      const existingAdmissionNo = await Student.findOne({ admissionNo });
      if (existingAdmissionNo) {
        return res.status(400).json({
          error: 'Admission number already exists'
        });
      }

      const existingUniversityRollNo = await Student.findOne({ universityRollNo });
      if (existingUniversityRollNo) {
        return res.status(400).json({
          error: 'University roll number already exists'
        });
      }
    }

    // Check for existing email
    const existingEmail = role === 'Faculty' 
      ? await Faculty.findOne({ email })
      : await Student.findOne({ email });
    
    if (existingEmail) {
      return res.status(400).json({
        error: 'Email already registered'
      });
    }

    console.log('Validation passed, hashing password...');
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully');

    if (role === 'Faculty') {
      console.log('Creating faculty record...');
      const newFaculty = new Faculty({
        email,
        name,
        department,
        subject,
        phone,
        password: hashedPassword,
        role,
      });
      await newFaculty.save();
      console.log('Faculty saved successfully');
      res.json({ msg: 'Faculty signed up successfully' });
    } else if (role === 'Student') {
      console.log('Creating student record...');
      
      // Prepare student data
      const studentData = {
        email,
        username: name,
        password: hashedPassword,
        role,
        admissionNo: admissionNo.toUpperCase(),
        universityRollNo: universityRollNo,
        semester,
        section,
      };

      // Add optional fields if provided
      if (dateOfBirth) studentData.dateOfBirth = new Date(dateOfBirth);
      if (phoneNumber) studentData.phoneNumber = phoneNumber;
      if (department) studentData.department = department;
      if (course) studentData.course = course;
      if (batch) studentData.batch = batch;
      if (address) studentData.address = address;
      if (guardianInfo) studentData.guardianInfo = guardianInfo;

      const newStudent = new Student(studentData);
      await newStudent.save();
      
      console.log('Student saved successfully');
      
      // Return success response with student summary
      res.json({ 
        msg: 'Student signed up successfully',
        student: newStudent.getSummary()
      });
    } else {
      console.log('Invalid role provided:', role);
      res.status(400).json({ error: 'Invalid role selected' });
    }
  } catch (error) {
    console.error('Signup error details:', error);
    console.error('Error stack:', error.stack);
    
    // Handle specific MongoDB errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        error: `${field} already exists`,
        details: error.message 
      });
    }
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        error: 'Validation failed',
        details: validationErrors
      });
    }
    
    res.status(500).json({ error: 'Failed to sign up', details: error.message });
  }
});

module.exports = router;
