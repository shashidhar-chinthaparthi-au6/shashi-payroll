const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { verifyToken, checkRole } = require('../middleware/auth');
const Employee = require('../models/Employee');
const STATUS = require('../utils/constants/statusCodes');
const MSG = require('../utils/constants/messages');
const config = require('../config/config');

// Register Admin
router.post('/register/admin', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role: 'admin' });
    await user.save();
    res.status(STATUS.CREATED).json({ message: MSG.AUTH_REGISTER_SUCCESS });
  } catch (error) {
    res.status(STATUS.BAD_REQUEST).json({ error: MSG.AUTH_EMAIL_IN_USE });
  }
});

// Register Client
router.post('/register/client', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role: 'client' });
    await user.save();
    res.status(STATUS.CREATED).json({ message: MSG.AUTH_REGISTER_SUCCESS });
  } catch (error) {
    res.status(STATUS.BAD_REQUEST).json({ error: MSG.AUTH_EMAIL_IN_USE });
  }
});

// Register Employee
router.post('/register/employee', async (req, res) => {
  try {
    const { name, email, password, firstName, lastName, department, position } = req.body;
    
    // Create user document
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ 
      name, 
      email, 
      password: hashedPassword, 
      role: 'employee' 
    });
    await user.save();

    // Create employee document
    const employee = new Employee({
      name,
      email,
      department,
      position,
      userId: user._id
    });
    await employee.save();

    res.status(STATUS.CREATED).json({
      message: MSG.AUTH_REGISTER_SUCCESS,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      employee: {
        id: employee._id,
        name: employee.name,
        email: employee.email,
        department: employee.department,
        position: employee.position,
        userId: employee.userId
      }
    });
  } catch (error) {
    res.status(STATUS.BAD_REQUEST).json({ error: MSG.AUTH_EMAIL_IN_USE });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    console.log('Login request received');
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    console.log('User found:', user);
    if (!user) {
      return res.status(STATUS.UNAUTHORIZED).json({ message: MSG.AUTH_INVALID_CREDENTIALS });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(STATUS.UNAUTHORIZED).json({ message: MSG.AUTH_INVALID_CREDENTIALS });
    }

    // If user is an employee, find their employee record using userId
    let employeeData = null;
    if (user.role === 'employee') {
      const employee = await Employee.findOne({ userId: user._id });
      if (employee) {
        employeeData = {
          id: employee._id,
          firstName: employee.firstName,
          lastName: employee.lastName,
          position: employee.position,
          shop: employee.shop
        };
      }
    }

    const jwtSecret = config[process.env.NODE_ENV || 'development'].jwt.secret;
    const token = jwt.sign(
      { id: user._id, role: user.role },
      jwtSecret,
      { expiresIn: '1h' }
    );

    res.status(STATUS.OK).json({
      success: true,
      message: MSG.AUTH_LOGIN_SUCCESS,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          employee: employeeData
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
});

// Change Password
router.post('/change-password', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    console.log('Change password request received for user:', req.userId);

    // Validate request body
    if (!currentPassword || !newPassword) {
      console.log('Missing required fields:', { currentPassword: !!currentPassword, newPassword: !!newPassword });
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    // Validate password length
    if (newPassword.length < 6) {
      console.log('Password too short:', newPassword.length);
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      console.log('User not found:', req.userId);
      return res.status(404).json({ error: 'User not found' });
    }

    try {
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        console.log('Invalid current password for user:', req.userId);
        return res.status(401).json({ error: 'Current password is incorrect' });
      }

      // Check if new password is same as current password
      const isSamePassword = await bcrypt.compare(newPassword, user.password);
      if (isSamePassword) {
        console.log('New password same as current password for user:', req.userId);
        return res.status(400).json({ error: 'New password must be different from current password' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();
      console.log('Password changed successfully for user:', req.userId);

      res.status(200).json({ message: 'Password changed successfully' });
    } catch (bcryptError) {
      console.error('Bcrypt error:', bcryptError);
      return res.status(500).json({ error: 'Error processing password' });
    }
  } catch (error) {
    console.error('Change password error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Invalid password format' });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    return res.status(500).json({ error: 'An unexpected error occurred while changing password' });
  }
});

module.exports = router; 