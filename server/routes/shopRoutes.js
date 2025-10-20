const express = require('express');
const router = express.Router();
const Shop = require('../models/Shop');
const { verifyToken, checkRole } = require('../middleware/auth');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Create a new shop (admin or client)
router.post('/', verifyToken, checkRole(['admin', 'client']), async (req, res) => {
  try {
    // Check if shop name already exists
    const existingShop = await Shop.findOne({ name: req.body.name });
    if (existingShop) {
      return res.status(400).json({ error: 'Shop name already exists' });
    }

    // Validate role
    const role = req.body.role?.toLowerCase();
    if (!role || !['admin', 'client'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be either "admin" or "client"' });
    }

    // Create owner user with specified role
    const defaultPassword = 'admin123'; // You might want to make this configurable
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    
    const ownerUser = new User({
      name: req.body.ownerName || `${req.body.name} Owner`,
      email: req.body.email,
      password: hashedPassword,
      role: role
    });
    await ownerUser.save();

    // Create shop with owner reference
    const shop = new Shop({
      ...req.body,
      owner: ownerUser._id
    });
    await shop.save();

    res.status(201).json({
      message: 'Shop created successfully with owner account',
      shop,
      owner: {
        email: ownerUser.email,
        password: defaultPassword,
        role: ownerUser.role
      }
    });
  } catch (error) {
    console.error('Error creating shop:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get all shops (admin only)
router.get('/all', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const shops = await Shop.find().populate('owner', 'name email');
    res.json(shops);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get shops owned by the authenticated client or all shops for employees
router.get('/my-shops', verifyToken, async (req, res) => {
  try {
    // console.log('Full req object:', req);
    console.log('req.userId:', req.userId);
    const user = await User.findById(req.userId);
    console.log('User:', user);
    console.log('User role:', user.role);
    let shops;
    if (user.role === 'client') {
      shops = await Shop.find({ owner: req.userId });
    } else if (user.role === 'employee') {
      shops = await Shop.find();
    }
    console.log('Shops found:', shops);
    res.json(shops);
  } catch (error) {
    console.error('Error fetching shops:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get shop by ID (admin or owner)
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    const user = await User.findById(req.userId);
    if (user.role !== 'admin' && shop.owner.toString() !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(shop);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update shop (admin or owner)
router.patch('/:id', verifyToken, checkRole(['admin', 'client']), async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    const user = await User.findById(req.userId);
    if (user.role !== 'admin' && shop.owner.toString() !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updates = Object.keys(req.body);
    updates.forEach(update => shop[update] = req.body[update]);
    await shop.save();

    res.json(shop);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete shop (owner only)
router.delete('/:id', verifyToken, checkRole(['admin', 'client']), async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    if (shop.owner.toString() !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await shop.remove();
    res.json({ message: 'Shop deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 