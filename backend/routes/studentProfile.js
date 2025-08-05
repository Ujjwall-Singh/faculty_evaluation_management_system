// routes/studentProfile.js
const express = require('express');
const Student = require('../models/Student');
const router = express.Router();

// GET student profile by ID
router.get('/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findById(studentId).select('-password');
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.json({
      success: true,
      student: student
    });
  } catch (error) {
    console.error('Get student profile error:', error);
    res.status(500).json({ error: 'Failed to fetch student profile' });
  }
});

// PUT update student profile
router.put('/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const updateData = req.body;
    
    // Remove fields that shouldn't be updated via this route
    delete updateData.password;
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.updatedAt;
    delete updateData.role;
    
    // Get current student to check if it's a legacy account
    const currentStudent = await Student.findById(studentId);
    if (!currentStudent) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    // Special handling for legacy accounts updating their profiles
    if (currentStudent.isLegacyAccount && currentStudent.needsProfileCompletion) {
      console.log('Updating legacy account profile:', currentStudent.email);
      
      // For legacy accounts, allow updating to real academic information
      // Remove temporary admission number if updating with real one
      if (updateData.admissionNo && currentStudent.admissionNo && currentStudent.admissionNo.startsWith('TEMP')) {
        console.log('Replacing temporary admission number with real one');
      }
      
      // If they're providing complete academic info, mark profile as completed
      if (updateData.admissionNo && updateData.universityRollNo && updateData.semester && updateData.section) {
        updateData.needsProfileCompletion = false;
        updateData.profileNeedsUpdate = false;
        updateData.lastUpdated = new Date();
        console.log('Marking legacy account profile as complete');
      }
    }
    
    // Special validation for unique fields if they're being updated
    if (updateData.email) {
      const existingEmail = await Student.findOne({ 
        email: updateData.email, 
        _id: { $ne: studentId } 
      });
      if (existingEmail) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    }
    
    if (updateData.admissionNo) {
      // Don't check uniqueness if it's the same student's current admission number
      const existingAdmission = await Student.findOne({ 
        admissionNo: updateData.admissionNo.toUpperCase(), 
        _id: { $ne: studentId } 
      });
      if (existingAdmission) {
        return res.status(400).json({ error: 'Admission number already exists' });
      }
      updateData.admissionNo = updateData.admissionNo.toUpperCase();
    }
    
    if (updateData.universityRollNo) {
      const existingRollNo = await Student.findOne({ 
        universityRollNo: updateData.universityRollNo, 
        _id: { $ne: studentId } 
      });
      if (existingRollNo) {
        return res.status(400).json({ error: 'University roll number already exists' });
      }
    }
    
    // Find and update student
    const student = await Student.findByIdAndUpdate(
      studentId,
      updateData,
      { 
        new: true, 
        runValidators: true,
        select: '-password'
      }
    );
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    // Special message for legacy accounts
    let message = 'Profile updated successfully';
    if (currentStudent.isLegacyAccount && !student.needsProfileCompletion) {
      message = 'Profile updated successfully! Your account is now fully set up.';
    }
    
    res.json({
      success: true,
      message: message,
      student: student,
      wasLegacyAccount: currentStudent.isLegacyAccount,
      profileCompleted: currentStudent.needsProfileCompletion && !student.needsProfileCompletion
    });
  } catch (error) {
    console.error('Update student profile error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        error: 'Validation failed',
        details: validationErrors
      });
    }
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        error: `${field} already exists`,
        details: error.message 
      });
    }
    
    res.status(500).json({ error: 'Failed to update student profile' });
  }
});

module.exports = router;
