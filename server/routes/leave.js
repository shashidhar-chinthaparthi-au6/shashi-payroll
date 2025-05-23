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
    const { employeeId, type, startDate, endDate, reason } = req.body;
    const leave = new Leave({ employeeId, type, startDate, endDate, reason });
    await leave.save();
    res.status(201).json({ message: 'Leave request submitted', leave });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get leave history for an employee (with optional month/year filtering)
router.get('/history/:employeeId', verifyToken, async (req, res) => {
  try {
    const { month, year } = req.query;
    const query = { employeeId: req.params.employeeId };
    if (month && year) {
      const m = parseInt(month);
      const y = parseInt(year);
      const start = new Date(y, m - 1, 1);
      const end = new Date(y, m, 0, 23, 59, 59, 999);
      query.startDate = { $lte: end };
      query.endDate = { $gte: start };
    }
    const leaves = await Leave.find(query).sort({ startDate: -1 });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get leave balances (dynamic logic)
router.get('/balance/:employeeId', verifyToken, async (req, res) => {
  try {
    const { employeeId } = req.params;
    // Get all approved or pending leaves for this employee
    const leaves = await Leave.find({ employeeId, status: { $in: ['approved', 'pending'] } });

    // Calculate used days for each type
    const balances = {};
    for (const { type, total } of LEAVE_TYPES) {
      const used = leaves
        .filter(l => l.type === type)
        .reduce((sum, l) => {
          const start = new Date(l.startDate);
          const end = new Date(l.endDate);
          return sum + (Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1);
        }, 0);
      balances[type] = {
        total,
        consumed: used,
        available: Math.max(total - used, 0)
      };
    }

    res.json(balances);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 