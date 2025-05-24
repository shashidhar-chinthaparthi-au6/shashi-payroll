const express = require('express');
const router = express.Router();
const Leave = require('../models/Leave');
const { verifyToken } = require('../middleware/auth');

const LEAVE_TYPES = [
  { type: 'casual', total: 10 },
  { type: 'sick', total: 7 },
  { type: 'annual', total: 20 }
];

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
    const query = { userId: req.params.userId };
    const leaves = await Leave.find(query)
      .sort({ startDate: -1 })
      .populate('approvedBy', 'name');
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get leave balance
router.get('/balance/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const leaves = await Leave.find({ userId, status: { $in: ['approved', 'pending'] } });
    
    const balance = LEAVE_TYPES.map(leaveType => {
      const used = leaves
        .filter(leave => leave.type === leaveType.type)
        .reduce((total, leave) => {
          const days = Math.ceil((leave.endDate - leave.startDate) / (1000 * 60 * 60 * 24));
          return total + days;
        }, 0);
      
      return {
        type: leaveType.type,
        total: leaveType.total,
        used,
        remaining: leaveType.total - used
      };
    });

    res.json(balance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 