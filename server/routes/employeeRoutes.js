const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const Shop = require('../models/Shop');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const { verifyToken, checkRole } = require('../middleware/auth');
const upload = require('../utils/multerConfig');

// Create a new employee
router.post('/', verifyToken, checkRole(['client']), async (req, res) => {
  try {
    const { firstName, lastName, email, phone, position, shop, dailySalary, department } = req.body;
    const defaultPassword = 'Welcome@123';

    // Create user account for employee
    const user = new User({
      name: `${firstName} ${lastName}`,
      email,
      password: await bcrypt.hash(defaultPassword, 10), // Default password
      role: 'employee'
    });
    await user.save();

    // Create employee record with userId
    const employee = new Employee({
      name: `${firstName} ${lastName}`,
      email,
      phone,
      position,
      department,
      shop,
      dailySalary,
      userId: user._id
    });

    await employee.save();

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: {
        employee: {
          id: employee._id,
          name: employee.name,
          email: employee.email,
          position: employee.position,
          department: employee.department,
          shop: employee.shop
        },
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        defaultPassword
      }
    });
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(400).json({ error: error.message });
  }
});

// Upload employee document
router.post('/:id/documents', verifyToken, checkRole(['client']), upload.single('document'), async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Verify shop ownership
    const shop = await Shop.findById(employee.shop);
    if (shop.owner.toString() !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    employee.documents.push({
      type: req.body.type,
      fileName: req.file.originalname,
      filePath: req.file.path
    });

    await employee.save();
    res.status(201).json(employee);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all employees for a shop
router.get('/shop/:shopId', verifyToken, checkRole(['client']), async (req, res) => {
  try {
    // Verify shop ownership
    const shop = await Shop.findById(req.params.shopId);
    if (!shop) {
      return res.status(404).json({ error: 'Shop not found' });
    }
    if (shop.owner.toString() !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const employees = await Employee.find({ shop: req.params.shopId });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get employee by ID
router.get('/:id', verifyToken, checkRole(['client']), async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Verify shop ownership
    const shop = await Shop.findById(employee.shop);
    if (shop.owner.toString() !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update employee
router.patch('/:id', verifyToken, checkRole(['client']), async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Verify shop ownership
    const shop = await Shop.findById(employee.shop);
    if (shop.owner.toString() !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updates = Object.keys(req.body);
    updates.forEach(update => employee[update] = req.body[update]);
    await employee.save();

    res.json(employee);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete employee
router.delete('/:id', verifyToken, checkRole(['client']), async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Verify shop ownership
    const shop = await Shop.findById(employee.shop);
    if (shop.owner.toString() !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await employee.remove();
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 