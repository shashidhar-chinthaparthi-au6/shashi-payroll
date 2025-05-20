const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const Shop = require('../models/Shop');
const { verifyToken, checkRole } = require('../middleware/auth');
const upload = require('../utils/multerConfig');

// Create a new employee
router.post('/', verifyToken, checkRole(['client']), async (req, res) => {
  try {
    // Verify shop ownership
    const shop = await Shop.findById(req.body.shop);
    if (!shop) {
      return res.status(404).json({ error: 'Shop not found' });
    }
    if (shop.owner.toString() !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const employee = new Employee(req.body);
    await employee.save();
    res.status(201).json(employee);
  } catch (error) {
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