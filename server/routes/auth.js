const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { verifyToken, checkRole } = require('../middleware/auth');
const responseHandler = require('../utils/responseHandler');
const statusCodes = require('../utils/statusCodes');

// Register Admin
router.post('/register/admin', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role: 'admin' });
    await user.save();
    responseHandler.success(res, null, 'Admin registered successfully', statusCodes.CREATED);
  } catch (error) {
    responseHandler.error(res, 'Email already registered', statusCodes.BAD_REQUEST);
  }
});

// Register Client
router.post('/register/client', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role: 'client' });
    await user.save();
    responseHandler.success(res, null, 'Client registered successfully', statusCodes.CREATED);
  } catch (error) {
    responseHandler.error(res, 'Email already registered', statusCodes.BAD_REQUEST);
  }
});

// Login (handles all user types)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email regardless of role
    const user = await User.findOne({ email });
    if (!user) {
      return responseHandler.error(res, 'User not found', statusCodes.UNAUTHORIZED);
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return responseHandler.error(res, 'Invalid credentials', statusCodes.UNAUTHORIZED);
    }

    // Generate token with user role
    const token = jwt.sign(
      { 
        id: user._id,
        role: user.role 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );

    // Return user data and token
    responseHandler.success(res, {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    }, 'Login successful');
  } catch (error) {
    responseHandler.error(res, 'Server error', statusCodes.INTERNAL_SERVER_ERROR);
  }
});

module.exports = router; 