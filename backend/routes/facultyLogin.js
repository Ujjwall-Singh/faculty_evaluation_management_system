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
    const faculty = await Faculty.findOne({ email: email.toLowerCase().trim() });
    if (!faculty) {
      return res.status(401).json({ 
        error: 'Email not found',
        message: 'No faculty account found with this email address. Please check your email or sign up first.'
      });
    }

    // Check if account is locked
    if (faculty.isLocked) {
      return res.status(423).json({ 
        error: 'Account temporarily locked',
        message: 'Too many failed login attempts. Please try again later or contact support.',
        lockUntil: faculty.lockUntil
      });
    }

    // Check if email is verified
    if (!faculty.isEmailVerified) {
      return res.status(403).json({ 
        error: 'Email not verified', 
        message: 'Please verify your email address before logging in. Check your email for verification link.',
        action: 'email_verification_required'
      });
    }

    // Check if faculty is approved
    if (faculty.status !== 'approved') {
      let message = '';
      if (faculty.status === 'pending') {
        message = 'Your account is pending approval from admin. Please wait for approval.';
      } else if (faculty.status === 'rejected') {
        message = faculty.rejectionReason 
          ? `Your account has been rejected. Reason: ${faculty.rejectionReason}` 
          : 'Your account has been rejected by admin.';
      }
      return res.status(403).json({ 
        error: 'Account not approved', 
        message: message,
        status: faculty.status,
        action: 'approval_required'
      });
    }

    // Verify the provided password against the hashed password in the database
    const match = await bcrypt.compare(password, faculty.password);
    if (!match) {
      // Increment login attempts on wrong password
      await faculty.incLoginAttempts();
      return res.status(401).json({ 
        error: 'Wrong password',
        message: 'Incorrect password. Please check your password and try again.'
      });
    }

    // Successful login - reset attempts and update last login
    await faculty.resetLoginAttempts();

    // If successful, respond with success message, faculty details
    res.json({ 
      success: true, 
      message: 'Login successful', 
      facultyId: faculty._id,
      name: faculty.name, 
      department: faculty.department,
      role: faculty.role,
      status: faculty.status,
      isEmailVerified: faculty.isEmailVerified,
      lastLogin: faculty.lastLogin
    });

  } catch (error) {
    console.error('Faculty Login error:', error); // Log the error for debugging
    res.status(500).json({ error: 'Server error' }); // Return server error response
  }
});

module.exports = router; // Export the router
