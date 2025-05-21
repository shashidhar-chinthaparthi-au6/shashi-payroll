const express = require('express');
const router = express.Router();
const Shop = require('../models/Shop');
const { verifyToken, checkRole } = require('../middleware/auth');
const User = require('../models/User');

// Create a new shop (admin or client)
router.post('/', verifyToken, checkRole(['admin', 'client']), async (req, res) => {
  try {
    const shop = new Shop({
      ...req.body,
      owner: req.userId
    });
    await shop.save();
    res.status(201).json(shop);
  } catch (error) {
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