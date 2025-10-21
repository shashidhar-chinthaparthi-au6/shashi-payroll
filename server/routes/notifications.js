const express = require('express');
const router = express.Router();
const { verifyToken, populateUser } = require('../middleware/auth');
const Notification = require('../models/Notification');
const STATUS = require('../utils/constants/statusCodes');
const MSG = require('../utils/constants/messages');

// Apply middleware to all notification routes
router.use(verifyToken);
router.use(populateUser);

// Get user notifications
router.get('/', async (req, res) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    
    const query = { recipient: userId };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }
    
    const notifications = await Notification.find(query)
      .populate('sender', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();
    
    const total = await Notification.countDocuments(query);
    
    return res.status(STATUS.OK).json({
      data: notifications,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      },
      message: MSG.SUCCESS || 'Success'
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// Get notification count
router.get('/count', async (req, res) => {
  try {
    const userId = req.userId;
    
    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      isRead: false
    });
    
    return res.status(STATUS.OK).json({
      data: { unreadCount },
      message: MSG.SUCCESS || 'Success'
    });
  } catch (error) {
    console.error('Get notification count error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// Mark notification as read
router.put('/:id/read', async (req, res) => {
  try {
    const userId = req.userId;
    const notificationId = req.params.id;
    
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );
    
    if (!notification) {
      return res.status(STATUS.NOT_FOUND).json({ message: MSG.NOT_FOUND || 'Notification not found' });
    }
    
    return res.status(STATUS.OK).json({
      data: notification,
      message: MSG.SUCCESS || 'Success'
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// Mark all notifications as read
router.put('/read-all', async (req, res) => {
  try {
    const userId = req.userId;
    
    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    
    return res.status(STATUS.OK).json({
      data: { message: 'All notifications marked as read' },
      message: MSG.SUCCESS || 'Success'
    });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// Delete notification
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.userId;
    const notificationId = req.params.id;
    
    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      recipient: userId
    });
    
    if (!notification) {
      return res.status(STATUS.NOT_FOUND).json({ message: MSG.NOT_FOUND || 'Notification not found' });
    }
    
    return res.status(STATUS.OK).json({
      data: { message: 'Notification deleted successfully' },
      message: MSG.SUCCESS || 'Success'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// Create notification (for system use)
router.post('/', async (req, res) => {
  try {
    const { recipient, type, title, message, data, priority = 'medium', category = 'info', actionUrl, expiresAt } = req.body;
    
    const notification = await Notification.create({
      recipient,
      sender: req.userId,
      type,
      title,
      message,
      data,
      priority,
      category,
      actionUrl,
      expiresAt: expiresAt ? new Date(expiresAt) : null
    });
    
    return res.status(STATUS.OK).json({
      data: notification,
      message: MSG.SUCCESS || 'Success'
    });
  } catch (error) {
    console.error('Create notification error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

module.exports = router;
