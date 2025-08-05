// routes/login.js
const express = require('express');
const bcrypt = require('bcryptjs');
const Student = require('../models/Student');

const router = express.Router(); 

router.post('/', async (req, res) => {
  const { email, password } = req.body;

  try {
    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }  

    const match = await bcrypt.compare(password, student.password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Update last login time
    student.lastLogin = new Date();
    await student.save();

    // Return complete student data (excluding password)
    const studentData = student.toObject();
    delete studentData.password;

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
      profileMessage: needsProfileUpdate ? 
        'Welcome back! Please update your profile with your academic information.' : null
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;