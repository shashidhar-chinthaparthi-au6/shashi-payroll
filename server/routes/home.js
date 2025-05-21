const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Notification = require('../models/Notification');
const Event = require('../models/Event');

// Get dashboard data
router.get('/dashboard/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get employee info
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Get today's attendance
    const attendance = await Attendance.findOne({
      employeeId,
      date: today
    });

    // Get recent notifications
    const notifications = await Notification.find({ employeeId })
      .sort({ createdAt: -1 })
      .limit(5);

    // Get upcoming events
    const events = await Event.find({
      $or: [
        { type: 'holiday' },
        { employeeId, type: 'leave', status: 'approved' }
      ],
      startDate: { $gte: today }
    }).sort({ startDate: 1 }).limit(5);

    res.json({
      employee,
      attendance,
      notifications,
      events
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark attendance
router.post('/attendance/check-in', async (req, res) => {
  try {
    const { employeeId } = req.body;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const attendance = await Attendance.findOneAndUpdate(
      { employeeId, date: today },
      { 
        checkIn: now,
        status: 'present'
      },
      { upsert: true, new: true }
    );

    res.json(attendance);
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/attendance/check-out', async (req, res) => {
  try {
    const { employeeId } = req.body;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const attendance = await Attendance.findOneAndUpdate(
      { employeeId, date: today },
      { checkOut: now },
      { new: true }
    );

    if (!attendance) {
      return res.status(404).json({ message: 'No check-in record found for today' });
    }

    res.json(attendance);
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 