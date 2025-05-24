const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Notification = require('../models/Notification');
const Event = require('../models/Event');
const { verifyToken } = require('../middleware/auth');
const { getTodayDateRange } = require('../utils/dateUtils');

// Get dashboard data
router.get('/dashboard/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { today, tomorrow } = getTodayDateRange();

    // Get employee info using userId
    const employee = await Employee.findOne({ userId: userId });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Get today's attendance
    const attendance = await Attendance.findOne({
      userId,
      date: {
        $gte: today,
        $lt: tomorrow
      }
    });

    // Get recent notifications
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5);

    // Get upcoming events
    const events = await Event.find({
      $or: [
        { type: 'holiday' },
        { userId, type: 'leave', status: 'approved' }
      ],
      startDate: { $gte: today }
    }).sort({ startDate: 1 }).limit(5);

    res.json({
      employee: {
        _id: employee._id,
        name: employee.name,
        email: employee.email,
        department: employee.department,
        position: employee.position,
        status: employee.status,
        joinDate: employee.joinDate
      },
      attendance: attendance ? {
        id: attendance._id,
        date: attendance.date,
        checkIn: attendance.checkIn,
        checkOut: attendance.checkOut,
        status: attendance.status
      } : null,
      notifications,
      events
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 