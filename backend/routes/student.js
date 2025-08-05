const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const bcrypt = require('bcryptjs');

// Get all students or search by query parameters
router.get('/', async (req, res) => {
  try {
    const { admissionNo, name, email } = req.query;
    
    let query = {};
    
    // Build query based on provided parameters
    if (admissionNo) {
      query.admissionNo = { $regex: admissionNo, $options: 'i' };
    }
    
    if (name) {
      query.$or = [
        { fullName: { $regex: name, $options: 'i' } },
        { username: { $regex: name, $options: 'i' } }
      ];
    }
    
    if (email) {
      query.email = { $regex: email, $options: 'i' };
    }
    
    const students = await Student.find(query).select('-password'); // Exclude password from response
    
    // Return in the format expected by frontend
    if (admissionNo || name || email) {
      res.json({ students });
    } else {
      res.json(students);
    }
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// Get student by ID
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).select('-password');
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ error: 'Failed to fetch student' });
  }
});

// Add new student
router.post('/', async (req, res) => {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if student already exists
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({ error: 'Student with this email already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newStudent = new Student({
      email,
      username,
      password: hashedPassword,
      role: 'Student'
    });

    await newStudent.save();
    
    // Return student without password
    const studentResponse = { ...newStudent.toObject() };
    delete studentResponse.password;
    
    res.status(201).json({ 
      message: 'Student added successfully',
      student: studentResponse 
    });
  } catch (error) {
    console.error('Error adding student:', error);
    res.status(500).json({ error: 'Failed to add student' });
  }
});

// Update student
router.put('/:id', async (req, res) => {
  try {
    const { 
      email, 
      username, 
      password, 
      admissionNo, 
      universityRollNo, 
      semester, 
      section, 
      department, 
      course, 
      batch 
    } = req.body;
    
    const updateData = { 
      email, 
      username, 
      admissionNo, 
      universityRollNo, 
      semester, 
      section, 
      department, 
      course, 
      batch 
    };

    // If password is provided, hash it
    if (password && password.trim() !== '') {
      const saltRounds = 10;
      updateData.password = await bcrypt.hash(password, saltRounds);
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select('-password');

    if (!updatedStudent) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({ 
      message: 'Student updated successfully',
      student: updatedStudent 
    });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ error: 'Failed to update student' });
  }
});

// Delete student
router.delete('/:id', async (req, res) => {
  try {
    const deletedStudent = await Student.findByIdAndDelete(req.params.id);
    
    if (!deletedStudent) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ error: 'Failed to delete student' });
  }
});

module.exports = router;
