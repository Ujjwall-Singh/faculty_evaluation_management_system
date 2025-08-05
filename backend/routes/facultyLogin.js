// // routes/facultyLogin.js
// const express = require('express');
// const bcrypt = require('bcryptjs'); // Import bcrypt for password hashing
// const Faculty = require('../models/Faculty'); // Import the Faculty model

// const router = express.Router(); // Create a new router

// // POST route for faculty login
// router.post('/', async (req, res) => {
//   const { email, password } = req.body; // Destructure email and password from request body

//   try {
//     // Verify if the faculty exists with the provided email
//     const faculty = await Faculty.findOne({ email });
//     if (!faculty) {
//       return res.status(401).json({ error: 'Invalid email or password' }); // If not found, return error
//     }

//     // Verify the provided password against the hashed password in the database
//     const match = await bcrypt.compare(password, faculty.password);
//     if (!match) {
//       return res.status(401).json({ error: 'Invalid email or password' }); // If passwords do not match, return error
//     }

//     // If successful, respond with success message and faculty ID
//     res.json({ success: true, message: 'Login successful', facultyId: faculty._id });
//   } catch (error) {
//     console.error('Faculty Login error:', error); // Log the error for debugging
//     res.status(500).json({ error: 'Server error' }); // Return server error response
//   }
// });

// module.exports = router; // Export the router
const express = require('express');
const bcrypt = require('bcryptjs'); // Import bcrypt for password hashing
const Faculty = require('../models/Faculty'); // Import the Faculty model

const router = express.Router(); // Create a new router

// POST route for faculty login
router.post('/', async (req, res) => {
  const { email, password } = req.body; // Destructure email and password from request body

  try {
    // Verify if the faculty exists with the provided email
    const faculty = await Faculty.findOne({ email });
    if (!faculty) {
      return res.status(401).json({ error: 'Invalid email or password' }); // If not found, return error
    }

    // Verify the provided password against the hashed password in the database
    const match = await bcrypt.compare(password, faculty.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password' }); // If passwords do not match, return error
    }

    // If successful, respond with success message, faculty ID, name, and department
    res.json({ 
      success: true, 
      message: 'Login successful', 
      facultyId: faculty._id,
      name: faculty.name, 
      department: faculty.department,
      role: faculty.role
    });

  } catch (error) {
    console.error('Faculty Login error:', error); // Log the error for debugging
    res.status(500).json({ error: 'Server error' }); // Return server error response
  }
});

module.exports = router; // Export the router
