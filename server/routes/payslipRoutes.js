const express = require('express');
const router = express.Router();
const payslipService = require('../services/payslipService');
const { verifyToken } = require('../middleware/auth');
const Payslip = require('../models/Payslip');
const path = require('path');

// Generate payslip
router.post('/generate', verifyToken, async (req, res) => {
  try {
    const { employeeId, month, year } = req.body;
    const payslip = await payslipService.generatePayslip(employeeId, month, year);
    res.json(payslip);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get payslip history for an employee
router.get('/employee/:employeeId', verifyToken, async (req, res) => {
  try {
    const payslips = await Payslip.find({ employee: req.params.employeeId })
      .sort({ year: -1, month: -1 });
    res.json(payslips);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get specific payslip
router.get('/:payslipId', verifyToken, async (req, res) => {
  try {
    const payslip = await Payslip.findById(req.params.payslipId)
      .populate('employee')
      .populate('approvedBy');
    if (!payslip) {
      return res.status(404).json({ error: 'Payslip not found' });
    }
    res.json(payslip);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Approve payslip
router.post('/:payslipId/approve', verifyToken, async (req, res) => {
  try {
    const payslip = await Payslip.findById(req.params.payslipId);
    if (!payslip) {
      return res.status(404).json({ error: 'Payslip not found' });
    }

    payslip.status = 'approved';
    payslip.approvedAt = new Date();
    payslip.approvedBy = req.userId;
    await payslip.save();

    // Try to send email with payslip, but don't fail if email sending fails
    try {
      await payslipService.sendPayslipEmail(payslip._id);
    } catch (emailError) {
      console.error('Failed to send payslip email:', emailError);
      // Continue with the response even if email fails
    }

    res.json(payslip);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Download payslip PDF
router.get('/:payslipId/download', verifyToken, async (req, res) => {
  try {
    const payslip = await Payslip.findById(req.params.payslipId);
    if (!payslip) {
      return res.status(404).json({ error: 'Payslip not found' });
    }

    const pdfPath = path.join(__dirname, '..', payslip.pdfUrl);
    res.download(pdfPath);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router; 