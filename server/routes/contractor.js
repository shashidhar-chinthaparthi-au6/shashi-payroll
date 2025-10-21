const express = require('express');
const router = express.Router();
const { verifyToken, populateUser, checkRole } = require('../middleware/auth');
const STATUS = require('../utils/constants/statusCodes');
const MSG = require('../utils/constants/messages');

// Apply middleware to all contractor routes
router.use(verifyToken);
router.use(populateUser);
router.use(checkRole(['contractor']));

// Get contractor dashboard data
router.get('/dashboard', async (req, res) => {
  try {
    const contractorId = req.userId;
    
    // Mock data for now - replace with actual database queries
    const stats = {
      totalContracts: 3,
      activeContracts: 2,
      totalEarnings: 15000,
      pendingInvoices: 1,
      totalHours: 120,
      attendanceRate: 95
    };
    
    return res.status(STATUS.OK).json({
      data: stats,
      message: MSG.SUCCESS || 'Success'
    });
  } catch (error) {
    console.error('Contractor dashboard error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// Get contractor activities
router.get('/activities', async (req, res) => {
  try {
    const contractorId = req.userId;
    
    // Mock data for now - replace with actual database queries
    const activities = [
      {
        _id: '1',
        type: 'attendance',
        action: 'Checked in for work',
        actorName: 'System',
        createdAt: new Date().toISOString()
      },
      {
        _id: '2',
        type: 'invoice',
        action: 'New invoice generated',
        actorName: 'System',
        createdAt: new Date(Date.now() - 86400000).toISOString()
      }
    ];
    
    return res.status(STATUS.OK).json({
      data: activities,
      message: MSG.SUCCESS || 'Success'
    });
  } catch (error) {
    console.error('Contractor activities error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// Get contractor profile
router.get('/profile', async (req, res) => {
  try {
    const contractorId = req.userId;
    
    // Mock data for now - replace with actual database queries
    const profile = {
      _id: contractorId,
      name: 'John Contractor',
      email: 'john@contractor.com',
      phone: '+1234567890',
      address: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA'
      },
      bankDetails: {
        accountNumber: '****1234',
        bankName: 'Bank of America',
        routingNumber: '123456789'
      },
      personalDetails: {
        dateOfBirth: '1990-01-01',
        emergencyContact: 'Jane Doe',
        emergencyPhone: '+1234567891'
      },
      skills: ['JavaScript', 'React', 'Node.js'],
      experience: 5,
      hourlyRate: 75,
      status: 'active',
      createdAt: new Date().toISOString()
    };
    
    return res.status(STATUS.OK).json({
      data: profile,
      message: MSG.SUCCESS || 'Success'
    });
  } catch (error) {
    console.error('Contractor profile error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// Update contractor profile
router.put('/profile', async (req, res) => {
  try {
    const contractorId = req.userId;
    const updateData = req.body;
    
    // Mock update - replace with actual database update
    console.log('Updating contractor profile:', contractorId, updateData);
    
    return res.status(STATUS.OK).json({
      data: { message: 'Profile updated successfully' },
      message: MSG.SUCCESS || 'Success'
    });
  } catch (error) {
    console.error('Contractor profile update error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// Get attendance status
router.get('/attendance/status', async (req, res) => {
  try {
    const contractorId = req.userId;
    
    // Mock data for now - replace with actual database queries
    const status = {
      isCheckedIn: false,
      checkInTime: null,
      checkOutTime: null,
      todayHours: 0,
      location: {
        latitude: 40.7128,
        longitude: -74.0060
      }
    };
    
    return res.status(STATUS.OK).json({
      data: status,
      message: MSG.SUCCESS || 'Success'
    });
  } catch (error) {
    console.error('Contractor attendance status error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// Check in
router.post('/attendance/checkin', async (req, res) => {
  try {
    const contractorId = req.userId;
    const { type, notes, location, timestamp } = req.body;
    
    // Mock check-in - replace with actual database operations
    console.log('Contractor check-in:', contractorId, { type, notes, location, timestamp });
    
    return res.status(STATUS.OK).json({
      data: { message: 'Checked in successfully' },
      message: MSG.SUCCESS || 'Success'
    });
  } catch (error) {
    console.error('Contractor check-in error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// Check out
router.post('/attendance/checkout', async (req, res) => {
  try {
    const contractorId = req.userId;
    const { notes, timestamp } = req.body;
    
    // Mock check-out - replace with actual database operations
    console.log('Contractor check-out:', contractorId, { notes, timestamp });
    
    return res.status(STATUS.OK).json({
      data: { message: 'Checked out successfully' },
      message: MSG.SUCCESS || 'Success'
    });
  } catch (error) {
    console.error('Contractor check-out error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// Get attendance history
router.get('/attendance', async (req, res) => {
  try {
    const contractorId = req.userId;
    const { page = 1, limit = 10, search, status, dateRange } = req.query;
    
    // Mock data for now - replace with actual database queries
    const attendance = [
      {
        _id: '1',
        date: new Date().toISOString(),
        checkIn: {
          time: new Date().toISOString(),
          method: 'manual'
        },
        checkOut: {
          time: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
          method: 'manual'
        },
        status: 'present',
        workingHours: 8,
        overtimeHours: 0,
        notes: 'Regular work day',
        contractTitle: 'Web Development Project',
        organizationName: 'Tech Corp'
      }
    ];
    
    return res.status(STATUS.OK).json({
      data: attendance,
      pagination: { current: parseInt(page), pages: 1, total: 1 },
      message: MSG.SUCCESS || 'Success'
    });
  } catch (error) {
    console.error('Contractor attendance history error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// Get invoices
router.get('/invoices', async (req, res) => {
  try {
    const contractorId = req.userId;
    
    // Mock data for now - replace with actual database queries
    const invoices = [
      {
        _id: '1',
        invoiceNumber: 'INV-001',
        contractTitle: 'Web Development Project',
        organizationName: 'Tech Corp',
        periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        periodEnd: new Date().toISOString(),
        billableHours: 40,
        rateAmount: 75,
        grossAmount: 3000,
        deductions: [
          { type: 'Tax', amount: 300 }
        ],
        netAmount: 2700,
        status: 'pending',
        generatedAt: new Date().toISOString()
      }
    ];
    
    return res.status(STATUS.OK).json({
      data: invoices,
      message: MSG.SUCCESS || 'Success'
    });
  } catch (error) {
    console.error('Contractor invoices error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// Get leave balance
router.get('/leave/balance', async (req, res) => {
  try {
    const contractorId = req.userId;
    
    // Mock data for now - replace with actual database queries
    const balance = {
      total: 20,
      used: 5,
      remaining: 15
    };
    
    return res.status(STATUS.OK).json({
      data: balance,
      message: MSG.SUCCESS || 'Success'
    });
  } catch (error) {
    console.error('Contractor leave balance error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// Get leave applications
router.get('/leave/applications', async (req, res) => {
  try {
    const contractorId = req.userId;
    
    // Mock data for now - replace with actual database queries
    const applications = [
      {
        _id: '1',
        type: 'sick',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        days: 1,
        reason: 'Not feeling well',
        status: 'pending',
        appliedAt: new Date().toISOString()
      }
    ];
    
    return res.status(STATUS.OK).json({
      data: applications,
      message: MSG.SUCCESS || 'Success'
    });
  } catch (error) {
    console.error('Contractor leave applications error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// Apply for leave
router.post('/leave/apply', async (req, res) => {
  try {
    const contractorId = req.userId;
    const { type, startDate, endDate, reason } = req.body;
    
    // Mock leave application - replace with actual database operations
    console.log('Contractor leave application:', contractorId, { type, startDate, endDate, reason });
    
    return res.status(STATUS.OK).json({
      data: { message: 'Leave application submitted successfully' },
      message: MSG.SUCCESS || 'Success'
    });
  } catch (error) {
    console.error('Contractor leave application error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// Export attendance
router.post('/attendance/export', async (req, res) => {
  try {
    const contractorId = req.userId;
    const { format, startDate, endDate, status } = req.body;
    
    // Mock export - replace with actual export functionality
    console.log('Contractor attendance export:', contractorId, { format, startDate, endDate, status });
    
    return res.status(STATUS.OK).json({
      data: { message: 'Attendance exported successfully' },
      message: MSG.SUCCESS || 'Success'
    });
  } catch (error) {
    console.error('Contractor attendance export error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

module.exports = router;
