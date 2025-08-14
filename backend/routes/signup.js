// routes/signup.js
const express = require('express');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const crypto = require('crypto');
const router = express.Router();
const Faculty = require('../models/Faculty');
const Student = require('../models/Student');
const EmailVerification = require('../models/EmailVerification');
const ValidationService = require('../utils/validationService');
const emailService = require('../utils/emailService');

router.post('/', async (req, res) => {
  console.log('\n=== SIGNUP REQUEST START ===');
  console.log('Full request body:', JSON.stringify(req.body, null, 2));
  console.log('Request headers:', req.headers);
  
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
    password: password ? 'provided' : 'MISSING',
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
    // Enhanced validation using ValidationService
    const validation = ValidationService.validateRegistration({
      email,
      name: name,
      password,
      phone: phone || phoneNumber,
      admissionNo,
      universityRollNo
    }, role);

    if (!validation.isValid) {
      console.log('Validation failed:', validation.errors);
      return res.status(400).json({ 
        error: 'Validation failed',
        details: validation.errors
      });
    }

    console.log('Validation passed successfully');

    // Use validated data
    const validatedEmail = validation.validatedData.email;
    const validatedName = validation.validatedData.name;

    // Role-specific validation
    if (role === 'Faculty') {
      if (!validatedEmail || !validatedName || !password || !department || !subject || !phone) {
        console.log('Faculty validation failed - missing fields');
        return res.status(400).json({ 
          error: 'All fields are required for faculty signup: email, name, password, department, subject, phone' 
        });
      }
    } else if (role === 'Student') {
      if (!validatedEmail || !validatedName || !password || !admissionNo || !universityRollNo || !semester || !section) {
        console.log('Student validation failed - missing fields');
        return res.status(400).json({ 
          error: 'Required fields for student signup: email, name, password, admission number, university roll number, semester, section' 
        });
      }

      // Additional validation for student-specific fields
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
      const existingAdmissionNo = await Student.findOne({ admissionNo: admissionNo.toUpperCase() });
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
    const existingEmailFaculty = await Faculty.findOne({ email: validatedEmail });
    const existingEmailStudent = await Student.findOne({ email: validatedEmail });
    
    if (existingEmailFaculty || existingEmailStudent) {
      return res.status(400).json({
        error: 'Email already registered'
      });
    }

    console.log('Validation passed, hashing password...');
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12); // Increased rounds for better security
    console.log('Password hashed successfully');

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationCode = EmailVerification.generateVerificationCode();

    let newUser;
    let userType = role;

    if (role === 'Faculty') {
      console.log('Creating faculty record...');
      newUser = new Faculty({
        email: validatedEmail,
        name: validatedName,
        department,
        subject,
        phone: validation.validatedData.phone || phone,
        password: hashedPassword,
        role,
        isEmailVerified: false,
        emailVerificationToken: verificationToken,
        emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      });
      await newUser.save();
      console.log('Faculty saved successfully');
      
    } else if (role === 'Student') {
      console.log('Creating student record...');
      
      // Prepare student data
      const studentData = {
        email: validatedEmail,
        username: validatedName,
        password: hashedPassword,
        role,
        admissionNo: validation.validatedData.admissionNo || admissionNo.toUpperCase(),
        universityRollNo: validation.validatedData.universityRollNo || universityRollNo,
        semester,
        section,
        isEmailVerified: false,
        emailVerificationToken: verificationToken,
        emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      };

      // Add optional fields if provided
      if (dateOfBirth) studentData.dateOfBirth = new Date(dateOfBirth);
      if (validation.validatedData.phone || phoneNumber) studentData.phoneNumber = validation.validatedData.phone || phoneNumber;
      if (department) studentData.department = department;
      if (course) studentData.course = course;
      if (batch) studentData.batch = batch;
      if (address) studentData.address = address;
      if (guardianInfo) studentData.guardianInfo = guardianInfo;

      newUser = new Student(studentData);
      await newUser.save();
      
      console.log('Student saved successfully');
    } else {
      console.log('Invalid role provided:', role);
      return res.status(400).json({ error: 'Invalid role selected' });
    }

    // Create email verification record
    const emailVerification = new EmailVerification({
      email: validatedEmail,
      verificationToken,
      verificationCode,
      userId: newUser._id,
      userType: userType
    });
    await emailVerification.save();

    // Send verification email
    try {
      await emailService.sendEmailVerification(
        validatedEmail,
        validatedName,
        verificationToken,
        verificationCode
      );
      console.log('Verification email sent successfully');
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Don't fail the registration if email fails, but log it
    }

    // Send admin notification for faculty registration
    if (role === 'Faculty') {
      try {
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@college.com';
        await emailService.sendAdminNewRegistrationAlert(
          adminEmail,
          'Faculty',
          validatedName,
          validatedEmail,
          department
        );
        console.log('Admin notification sent successfully');
      } catch (emailError) {
        console.error('Failed to send admin notification:', emailError);
      }
    }

    // Return success response
    if (role === 'Faculty') {
      res.json({ 
        msg: 'Faculty registration submitted successfully! Please check your email to verify your account. After email verification, your account will be pending approval from admin.',
        status: 'pending',
        emailSent: true,
        nextSteps: [
          'Check your email for verification link',
          'Click the verification link or enter the code',
          'Wait for admin approval',
          'You will receive an email once approved'
        ]
      });
    } else {
      res.json({ 
        msg: 'Student registration successful! Please check your email to verify your account before logging in.',
        student: newUser.getSummary(),
        emailSent: true,
        nextSteps: [
          'Check your email for verification link',
          'Click the verification link or enter the code',
          'Login with your credentials after verification'
        ]
      });
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
