const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { verifyToken, checkRole } = require('../middleware/auth');
const responseHandler = require('../utils/responseHandler');
const statusCodes = require('../utils/statusCodes');
const Employee = require('../models/Employee');

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

    responseHandler.success(res, {
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
    }, 'Employee registered successfully', statusCodes.CREATED);
  } catch (error) {
    responseHandler.error(res, 'Email already registered', statusCodes.BAD_REQUEST);
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
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

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
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
    res.status(500).json({ message: error.message });
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
      return responseHandler.error(res, 'Current password and new password are required', statusCodes.BAD_REQUEST);
    }

    // Validate password length
    if (newPassword.length < 6) {
      console.log('Password too short:', newPassword.length);
      return responseHandler.error(res, 'New password must be at least 6 characters long', statusCodes.BAD_REQUEST);
    }

    const user = await User.findById(req.userId);
    if (!user) {
      console.log('User not found:', req.userId);
      return responseHandler.error(res, 'User not found', statusCodes.NOT_FOUND);
    }

    try {
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        console.log('Invalid current password for user:', req.userId);
        return responseHandler.error(res, 'Current password is incorrect', statusCodes.UNAUTHORIZED);
      }

      // Check if new password is same as current password
      const isSamePassword = await bcrypt.compare(newPassword, user.password);
      if (isSamePassword) {
        console.log('New password same as current password for user:', req.userId);
        return responseHandler.error(res, 'New password must be different from current password', statusCodes.BAD_REQUEST);
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();
      console.log('Password changed successfully for user:', req.userId);

      responseHandler.success(res, null, 'Password changed successfully', statusCodes.OK);
    } catch (bcryptError) {
      console.error('Bcrypt error:', bcryptError);
      return responseHandler.error(res, 'Error processing password', statusCodes.INTERNAL_SERVER_ERROR);
    }
  } catch (error) {
    console.error('Change password error:', error);
    if (error.name === 'ValidationError') {
      return responseHandler.error(res, 'Invalid password format', statusCodes.BAD_REQUEST);
    }
    if (error.name === 'CastError') {
      return responseHandler.error(res, 'Invalid user ID', statusCodes.BAD_REQUEST);
    }
    return responseHandler.error(res, 'An unexpected error occurred while changing password', statusCodes.INTERNAL_SERVER_ERROR);
  }
});

module.exports = router; 