const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Payslip = require('../models/Payslip');
const User = require('../models/User');
const STATUS = require('../utils/constants/statusCodes');
const MSG = require('../utils/constants/messages');
const { verifyToken, checkRole, populateUser } = require('../middleware/auth');

// All employee routes require employee role
router.use(verifyToken, populateUser, checkRole(['employee']));

// Get employee profile
router.get('/profile', async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.userId })
      .populate('userId', 'name email')
      .lean();

    if (!employee) {
      return res.status(STATUS.NOT_FOUND).json({ message: MSG.NOT_FOUND || 'Employee not found' });
    }

    return res.status(STATUS.OK).json({
      data: employee,
      message: MSG.SUCCESS || 'Success'
    });
  } catch (error) {
    console.error('Get employee profile error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// Update employee profile
router.put('/profile', async (req, res) => {
  try {
    const { name, phone, personalDetails, bankDetails } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (personalDetails) updateData.personalDetails = personalDetails;
    if (bankDetails) updateData.bankDetails = bankDetails;

    const employee = await Employee.findOneAndUpdate(
      { userId: req.userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!employee) {
      return res.status(STATUS.NOT_FOUND).json({ message: MSG.NOT_FOUND || 'Employee not found' });
    }

    return res.status(STATUS.OK).json({
      data: employee,
      message: MSG.SUCCESS || 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update employee profile error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// Get attendance status for today
router.get('/attendance/status', async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.userId });
    if (!employee) {
      return res.status(STATUS.NOT_FOUND).json({ message: MSG.NOT_FOUND || 'Employee not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAttendance = await Attendance.findOne({
      userId: req.userId,
      date: { $gte: today, $lt: tomorrow }
    });

    const canCheckIn = !todayAttendance || !todayAttendance.checkIn;
    const canCheckOut = todayAttendance && todayAttendance.checkIn && !todayAttendance.checkOut;
    const isCheckedIn = todayAttendance && todayAttendance.checkIn && !todayAttendance.checkOut;

    let currentStatus = 'not_checked';
    if (todayAttendance) {
      if (todayAttendance.checkIn && todayAttendance.checkOut) {
        currentStatus = 'present';
      } else if (todayAttendance.checkIn) {
        currentStatus = 'present';
      } else {
        currentStatus = 'absent';
      }
    }

    // Calculate working hours
    let workingHours = 0;
    let todayHours = 0;
    if (todayAttendance && todayAttendance.checkIn && todayAttendance.checkOut) {
      const checkInTime = new Date(todayAttendance.checkIn.time);
      const checkOutTime = new Date(todayAttendance.checkOut.time);
      workingHours = (checkOutTime - checkInTime) / (1000 * 60 * 60);
      todayHours = workingHours;
    }

    return res.status(STATUS.OK).json({
      data: {
        canCheckIn,
        canCheckOut,
        isCheckedIn,
        currentStatus,
        lastCheckIn: todayAttendance?.checkIn?.time,
        lastCheckOut: todayAttendance?.checkOut?.time,
        workingHours,
        todayHours
      },
      message: MSG.SUCCESS || 'Success'
    });
  } catch (error) {
    console.error('Get attendance status error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// Check in
router.post('/attendance/checkin', async (req, res) => {
  try {
    const { type, notes, location, timestamp } = req.body;
    
    const employee = await Employee.findOne({ userId: req.userId });
    if (!employee) {
      return res.status(STATUS.NOT_FOUND).json({ message: MSG.NOT_FOUND || 'Employee not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Check if already checked in today
    const existingAttendance = await Attendance.findOne({
      userId: req.userId,
      date: { $gte: today, $lt: tomorrow }
    });

    if (existingAttendance && existingAttendance.checkIn) {
      return res.status(STATUS.BAD_REQUEST).json({ 
        message: MSG.BAD_REQUEST || 'Already checked in today' 
      });
    }

    // If there's an existing record without checkIn, we'll update it
    // If there's no existing record, we'll create a new one

    const checkInTime = new Date(timestamp || new Date());
    
    // Map client type to valid method enum
    let method = 'manual';
    if (type === 'office' || type === 'remote' || type === 'manual') {
      method = 'manual';
    } else if (type === 'qr') {
      method = 'qr';
    } else if (type === 'biometric') {
      method = 'biometric';
    }
    
    const attendanceData = {
      userId: req.userId,
      date: today,
      checkIn: {
        time: checkInTime,
        method: method
      },
      status: 'present',
      notes: notes
    };

    if (existingAttendance) {
      // Update existing record
      existingAttendance.checkIn = attendanceData.checkIn;
      existingAttendance.status = 'present';
      await existingAttendance.save();
    } else {
      // Create new record
      await Attendance.create(attendanceData);
    }

    return res.status(STATUS.OK).json({
      data: { message: 'Checked in successfully' },
      message: MSG.SUCCESS || 'Success'
    });
  } catch (error) {
    console.error('Check in error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// Check out
router.post('/attendance/checkout', async (req, res) => {
  try {
    const { notes, location, timestamp } = req.body;
    
    const employee = await Employee.findOne({ userId: req.userId });
    if (!employee) {
      return res.status(STATUS.NOT_FOUND).json({ message: MSG.NOT_FOUND || 'Employee not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const attendance = await Attendance.findOne({
      userId: req.userId,
      date: { $gte: today, $lt: tomorrow }
    });

    if (!attendance || !attendance.checkIn) {
      return res.status(STATUS.BAD_REQUEST).json({ 
        message: MSG.BAD_REQUEST || 'Must check in before checking out' 
      });
    }

    if (attendance.checkOut) {
      return res.status(STATUS.BAD_REQUEST).json({ 
        message: MSG.BAD_REQUEST || 'Already checked out today' 
      });
    }

    const checkOutTime = new Date(timestamp || new Date());
    attendance.checkOut = {
      time: checkOutTime,
      method: 'manual'
    };

    // Calculate working hours
    const checkInTime = new Date(attendance.checkIn.time);
    const workingHours = (checkOutTime - checkInTime) / (1000 * 60 * 60);
    attendance.workingHours = workingHours;

    await attendance.save();

    return res.status(STATUS.OK).json({
      data: { message: 'Checked out successfully' },
      message: MSG.SUCCESS || 'Success'
    });
  } catch (error) {
    console.error('Check out error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// Get employee attendance history
router.get('/attendance', async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate } = req.query;
    
    const employee = await Employee.findOne({ userId: req.userId });
    if (!employee) {
      return res.status(STATUS.NOT_FOUND).json({ message: MSG.NOT_FOUND || 'Employee not found' });
    }

    const query = { userId: req.userId };
    
    // Add date filter if provided
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendance = await Attendance.find(query)
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Attendance.countDocuments(query);

    return res.status(STATUS.OK).json({
      data: attendance,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      },
      message: MSG.SUCCESS || 'Success'
    });
  } catch (error) {
    console.error('Get attendance history error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// Get leave balance
router.get('/leave/balance', async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.userId });
    if (!employee) {
      return res.status(STATUS.NOT_FOUND).json({ message: MSG.NOT_FOUND || 'Employee not found' });
    }

    // Mock leave balance - in real implementation, this would come from employee record
    const leaveBalance = {
      sickLeave: 12,
      casualLeave: 12,
      annualLeave: 21,
      personalLeave: 5,
      totalLeave: 50
    };

    return res.status(STATUS.OK).json({
      data: leaveBalance,
      message: MSG.SUCCESS || 'Success'
    });
  } catch (error) {
    console.error('Get leave balance error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// Get leave applications
router.get('/leave/applications', async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.userId });
    if (!employee) {
      return res.status(STATUS.NOT_FOUND).json({ message: MSG.NOT_FOUND || 'Employee not found' });
    }

    const applications = await Leave.find({ userId: req.userId })
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(STATUS.OK).json({
      data: applications,
      message: MSG.SUCCESS || 'Success'
    });
  } catch (error) {
    console.error('Get leave applications error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// Apply for leave
router.post('/leave/apply', async (req, res) => {
  try {
    const { type, startDate, endDate, days, reason } = req.body;
    
    const employee = await Employee.findOne({ userId: req.userId });
    if (!employee) {
      return res.status(STATUS.NOT_FOUND).json({ message: MSG.NOT_FOUND || 'Employee not found' });
    }

    const leaveData = {
      userId: req.userId,
      type,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
      status: 'pending'
    };

    const leave = await Leave.create(leaveData);

    return res.status(STATUS.OK).json({
      data: leave,
      message: MSG.SUCCESS || 'Leave application submitted successfully'
    });
  } catch (error) {
    console.error('Apply leave error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// Get employee payslips
router.get('/payslips', async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.userId });
    if (!employee) {
      return res.status(STATUS.NOT_FOUND).json({ message: MSG.NOT_FOUND || 'Employee not found' });
    }

    const payslips = await Payslip.find({ userId: req.userId })
      .sort({ month: -1, year: -1 })
      .lean();

    return res.status(STATUS.OK).json({
      data: payslips,
      message: MSG.SUCCESS || 'Success'
    });
  } catch (error) {
    console.error('Get employee payslips error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

module.exports = router;
