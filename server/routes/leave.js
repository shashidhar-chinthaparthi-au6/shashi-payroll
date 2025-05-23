const express = require('express');
const router = express.Router();
const Leave = require('../models/Leave');
const { verifyToken } = require('../middleware/auth');

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

// Get leave history for an employee
router.get('/history/:employeeId', verifyToken, async (req, res) => {
  try {
    const leaves = await Leave.find({ employeeId: req.params.employeeId }).sort({ startDate: -1 });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get leave balances (dummy logic)
router.get('/balance/:employeeId', verifyToken, async (req, res) => {
  res.json({
    casual: { total: 10, consumed: 3, available: 7 },
    sick: { total: 7, consumed: 2, available: 5 },
    annual: { total: 20, consumed: 8, available: 12 }
  });
});

module.exports = router; 