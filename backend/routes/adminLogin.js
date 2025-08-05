const express = require('express');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
require('dotenv').config();

const router = express.Router();

// Static admin credentials from environment variables
const STATIC_ADMIN = {
  email: process.env.ADMIN_EMAIL || 'admin@college.com',
  name: process.env.ADMIN_NAME || 'Admin',
  password: process.env.ADMIN_PASSWORD || 'password',
  role: 'Admin'
};

// Hash the static admin password for comparison
const getStaticAdminPasswordHash = async () => {
  return await bcrypt.hash(STATIC_ADMIN.password, 10);
};

router.post('/', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if it's the static admin
    if (email === STATIC_ADMIN.email) {
      // Hash the provided password and compare with stored hash
      const hashedPassword = await getStaticAdminPasswordHash();
      const match = await bcrypt.compare(password, hashedPassword);
      
      if (match) {
        return res.json({ 
          success: true, 
          message: 'Admin login successful', 
          adminId: 'static-admin',
          name: STATIC_ADMIN.name,
          role: STATIC_ADMIN.role
        });
      }
    }

    // Check database for other admins
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    res.json({ 
      success: true, 
      message: 'Admin login successful', 
      adminId: admin._id,
      name: admin.name,
      role: admin.role
    });

  } catch (error) {
    console.error('Admin Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 