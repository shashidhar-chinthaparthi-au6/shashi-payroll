const express = require('express');
const router = express.Router();
const payslipService = require('../services/payslipService');
const { verifyToken, checkRole } = require('../middleware/auth');
const Payslip = require('../models/Payslip');
const path = require('path');
const User = require('../models/User');

// Get logged-in employee's payslips
router.get('/employee/me', verifyToken, checkRole(['employee']), async (req, res) => {
  try {
    const userId = req.userId;
    console.log('Fetching payslips for user:', userId);

    const payslips = await Payslip.find({ userId })
      .sort({ year: -1, month: -1 })
      .lean();

    console.log('Found payslips:', payslips.length);

    const formattedPayslips = payslips.map(payslip => ({
      _id: payslip._id,
      date: payslip.generatedAt,
      basicSalary: payslip.basicSalary,
      allowances: payslip.allowances.reduce((sum, a) => sum + (a.amount || 0), 0),
      deductions: payslip.deductions.reduce((sum, d) => sum + (d.amount || 0), 0),
      netSalary: payslip.netSalary,
      status: payslip.status,
      month: payslip.month,
      year: payslip.year
    }));

    console.log('Successfully formatted payslips');
    res.json(formattedPayslips);
  } catch (error) {
    console.error('Error in /employee/me endpoint:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get payslip history for an employee
router.get('/employee/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Fetching payslips for user:', userId);

    const payslips = await Payslip.find({ userId })
      .sort({ year: -1, month: -1 })
      .lean();

    console.log('Found payslips:', payslips.length);

    const formattedPayslips = payslips.map(payslip => ({
      _id: payslip._id,
      month: payslip.month,
      year: payslip.year,
      basicSalary: payslip.basicSalary,
      allowances: payslip.allowances,
      deductions: payslip.deductions,
      netSalary: payslip.netSalary,
      status: payslip.status,
      attendance: payslip.attendance,
      generatedAt: payslip.generatedAt,
      approvedAt: payslip.approvedAt,
      pdfUrl: payslip.pdfUrl
    }));

    console.log('Successfully formatted payslips');
    res.json(formattedPayslips);
  } catch (error) {
    console.error('Error in /employee/:userId endpoint:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Generate payslip
router.post('/generate', verifyToken, async (req, res) => {
  try {
    const { userId, month, year } = req.body;
    const payslip = await payslipService.generatePayslip(userId, month, year);
    res.json(payslip);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get specific payslip
router.get('/:payslipId', verifyToken, async (req, res) => {
  try {
    const payslip = await Payslip.findById(req.params.payslipId);
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