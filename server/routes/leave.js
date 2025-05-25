const express = require('express');
const router = express.Router();
const Leave = require('../models/Leave');
const { verifyToken } = require('../middleware/auth');

const LEAVE_TYPES = [
  { type: 'casual', total: 10 },
  { type: 'sick', total: 7 },
  { type: 'annual', total: 20 }
];

// Helper function to calculate days between dates
const calculateDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1; // Include both start and end dates
};

// Request leave
router.post('/request', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { type, startDate, endDate, reason } = req.body;
    const leave = new Leave({ userId, type, startDate, endDate, reason });
    await leave.save();
    res.status(201).json({ message: 'Leave request submitted', leave });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get leave history
router.get('/history/:userId', verifyToken, async (req, res) => {
  try {
    const { month, year } = req.query;
    const query = { userId: req.params.userId };

    // Add date range filter if month and year are provided
    if (month !== undefined && year !== undefined) {
      const startDate = new Date(year, month, 1); // First day of the month
      const endDate = new Date(year, Number(month) + 1, 0, 23, 59, 59, 999); // Last day of the month
      
      query.startDate = { $gte: startDate, $lte: endDate };
    }

    const leaves = await Leave.find(query)
      .sort({ startDate: -1 })
      .populate('approvedBy', 'name');
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get leave balance
router.get('/balance', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const leaves = await Leave.find({ userId, status: { $in: ['approved', 'pending'] } });
    console.log("leaves", leaves);
    
    const balance = LEAVE_TYPES.map(leaveType => {
      const used = leaves
        .filter(leave => leave.type === leaveType.type)
        .reduce((total, leave) => {
          const days = calculateDays(leave.startDate, leave.endDate);
          return total + days;
        }, 0);
      
      return {
        type: leaveType.type,
        total: leaveType.total,
        used,
        remaining: Math.max(0, leaveType.total - used) // Ensure remaining is not negative
      };
    });

    res.json(balance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 