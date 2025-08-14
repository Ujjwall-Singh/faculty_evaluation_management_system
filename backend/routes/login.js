// routes/login.js
const express = require('express');
const bcrypt = require('bcryptjs');
const Student = require('../models/Student');
const ValidationService = require('../utils/validationService');

const router = express.Router(); 

router.post('/', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate email format
    const emailValidation = ValidationService.validateEmail(email);
    if (!emailValidation.isValid) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email format',
        details: emailValidation.errors 
      });
    }

    const validatedEmail = emailValidation.email;

    const student = await Student.findOne({ email: validatedEmail });
    if (!student) {
      return res.status(401).json({ 
        success: false, 
        message: 'No account found with this email address. Please check your email or sign up first.',
        error: 'Email not found'
      });
    }  

    // Check if account is locked
    if (student.isLocked) {
      return res.status(423).json({ 
        success: false,
        message: 'Account temporarily locked due to too many failed login attempts. Please try again later or contact support.',
        error: 'Account locked',
        lockUntil: student.lockUntil
      });
    }

    // Check if email is verified
    if (!student.isEmailVerified) {
      return res.status(403).json({ 
        success: false,
        error: 'Email not verified', 
        message: 'Please verify your email address before logging in. Check your email for verification link.',
        action: 'email_verification_required',
        email: validatedEmail
      });
    }

    // Check if account is active
    if (!student.isActive) {
      return res.status(403).json({ 
        success: false,
        error: 'Account inactive', 
        message: 'Your account has been deactivated. Please contact support for assistance.'
      });
    }

    const match = await bcrypt.compare(password, student.password);
    if (!match) {
      // Increment login attempts on wrong password
      await student.incLoginAttempts();
      return res.status(401).json({ 
        success: false, 
        message: 'Incorrect password. Please check your password and try again.',
        error: 'Wrong password'
      });
    }

    // Successful login - reset attempts and update last login
    await student.resetLoginAttempts();

    // Return complete student data (excluding password)
    const studentData = student.toObject();
    delete studentData.password;
    delete studentData.emailVerificationToken;

    // Check if this is a legacy account that needs profile completion
    const needsProfileUpdate = student.isLegacyAccount && student.needsProfileCompletion;

    res.json({ 
      success: true, 
      message: 'Login successful', 
      studentId: student._id,
      name: student.username || student.fullName,
      role: student.role,
      student: studentData, // Complete student information
      isLegacyAccount: student.isLegacyAccount,
      needsProfileUpdate: needsProfileUpdate,
      isEmailVerified: student.isEmailVerified,
      profileMessage: needsProfileUpdate ? 
        'Welcome back! Please update your profile with your academic information.' : null,
      securityInfo: {
        lastLogin: student.lastLogin,
        loginAttempts: 0 // Reset after successful login
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;