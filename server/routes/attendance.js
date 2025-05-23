const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const Shop = require('../models/Shop');
const { verifyToken, checkRole } = require('../middleware/auth');

// Helper function to get today's date range
const getTodayDateRange = () => {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  return { today, tomorrow };
};

// Manual check-in
router.post('/check-in', verifyToken, async (req, res) => {
  try {
    const { employeeId, shopId } = req.body;
    console.log('Check-in request:', { employeeId, shopId });
    // Validate employee and shop
    const employee = await Employee.findById(employeeId);
    console.log('Employee found:', employee ? 'yes' : 'no');
    const shop = await Shop.findById(shopId);
    console.log('Shop found:', shop ? 'yes' : 'no');
    
    if (!employee || !shop) {
      return res.status(404).json({ message: 'Employee or shop not found' });
    }

    // Check if already checked in today
    const { today, tomorrow } = getTodayDateRange();
    console.log('Date range for check-in:', { today, tomorrow });
    
    const existingAttendance = await Attendance.findOne({
      employee: employeeId,
      date: {
        $gte: today,
        $lt: tomorrow
      }
    });
    console.log('Existing attendance:', existingAttendance ? 'yes' : 'no');
    if (existingAttendance) {
      console.log('Already checked in today');
      return res.status(400).json({ message: 'Already checked in today' });
    }
    console.log('Creating new attendance record');
    // Only set checkIn, do NOT set checkOut
    const attendance = new Attendance({
      employee: employeeId,
      shop: shopId,
      date: today,
      checkIn: {
        time: new Date(),
        method: 'manual'
      }
    });

    await attendance.save();
    // console.log('Created attendance:', attendance);
    res.status(201).json(attendance);
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ message: error.message });
  }
});

// QR code check-in
router.post('/qr-check-in', verifyToken, async (req, res) => {
  try {
    const { employeeId, shopId } = req.body;
    
    // Validate employee and shop
    const employee = await Employee.findById(employeeId);
    const shop = await Shop.findById(shopId);
    
    if (!employee || !shop) {
      return res.status(404).json({ message: 'Employee or shop not found' });
    }

    // Check if already checked in today
    const { today, tomorrow } = getTodayDateRange();
    
    const existingAttendance = await Attendance.findOne({
      employee: employeeId,
      date: {
        $gte: today,
        $lt: tomorrow
      }
    });

    if (existingAttendance) {
      return res.status(400).json({ message: 'Already checked in today' });
    }

    const attendance = new Attendance({
      employee: employeeId,
      shop: shopId,
      date: today,
      checkIn: {
        time: new Date(),
        method: 'qr'
      }
    });

    await attendance.save();
    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Check-out
router.post('/check-out', verifyToken, async (req, res) => {
  try {
    const { employeeId, method = 'manual' } = req.body;
    console.log('Check-out request:', { employeeId, method });
    
    // Validate employee
    const employee = await Employee.findById(employeeId);
    console.log('Found employee:', employee ? 'yes' : 'no');
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    const { today, tomorrow } = getTodayDateRange();
    console.log('Date range for check-out:', { today, tomorrow });
    
    // Find attendance record using employeeId (which could be string or ObjectId)
    const attendance = await Attendance.findOne({
      employee: employeeId,
      date: {
        $gte: today,
        $lt: tomorrow
      }
    });

    console.log('Found attendance:', attendance ? 'yes' : 'no');
    if (attendance) {
      console.log('Attendance details:', {
        hasCheckOut: !!attendance.checkOut,
        employee: attendance.employee.toString(),
        date: attendance.date,
        checkIn: attendance.checkIn
      });
    }

    if (!attendance) {
      return res.status(404).json({ message: 'No check-in found for today' });
    }

    if (attendance.checkOut) {
      return res.status(400).json({ message: 'Already checked out today' });
    }

    attendance.checkOut = {
      time: new Date(),
      method
    };

    await attendance.save();
    console.log('Updated attendance:', attendance);
    res.json(attendance);
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get attendance logs for an employee
router.get('/employee/:employeeId', verifyToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { employee: req.params.employeeId };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendance = await Attendance.find(query)
      .sort({ date: -1 })
      .populate('shop', 'name')
      .populate('employee', 'firstName lastName');

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get attendance logs for a shop (admin or shop owner)
router.get('/shop/:shopId', verifyToken, checkRole(['admin', 'client']), async (req, res) => {
  try {
    console.log('Shop attendance request:', {
      shopId: req.params.shopId,
      userId: req.userId,
      role: req.userRole
    });

    // If client, verify shop ownership
    if (req.userRole === 'client') {
      const shop = await Shop.findById(req.params.shopId);
      if (!shop) {
        return res.status(404).json({ message: 'Shop not found' });
      }
      if (shop.owner.toString() !== req.userId) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    const { startDate, endDate } = req.query;
    const query = { shop: req.params.shopId };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendance = await Attendance.find(query)
      .sort({ date: -1 })
      .populate('employee', 'firstName lastName')
      .populate('shop', 'name');

    console.log('Found attendance records:', attendance.length);

    if (!attendance || attendance.length === 0) {
      return res.status(404).json({ message: 'No attendance records found for this shop' });
    }

    res.json(attendance);
  } catch (error) {
    console.error('Shop attendance error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get employee's attendance records
router.get('/employee', verifyToken, checkRole(['employee']), async (req, res) => {
  try {
    // Find the employee document for the logged-in user
    const userId = req.userId;
    const employee = await Employee.findOne({ userId: userId });
    if (!employee) {
      return res.status(404).json({ error: 'Employee record not found for this user' });
    }

    // Use the employee's _id to find attendance records
    const attendance = await Attendance.find({ employee: employee._id })
      .sort({ date: -1 })
      .limit(30)
      .lean();

    // Format the response as needed
    const formattedAttendance = attendance.map(record => ({
      date: record.date,
      checkIn: record.checkIn ? {
        time: record.checkIn.time.toISOString(),
        method: record.checkIn.method
      } : null,
      checkOut: record.checkOut ? {
        time: record.checkOut.time.toISOString(),
        method: record.checkOut.method
      } : null,
      status: record.status,
      notes: record.notes
    }));

    res.json(formattedAttendance);
  } catch (error) {
    console.error('Error fetching employee attendance:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper to get all working days (Mon-Fri) in a month
function getWorkingDays(year, month) {
  const days = [];
  const date = new Date(year, month - 1, 1);
  while (date.getMonth() === month - 1) {
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      days.push(new Date(date));
    }
    date.setDate(date.getDate() + 1);
  }
  return days;
}

// Get monthly attendance summary for an employee
router.get('/monthly-summary/:employeeId', verifyToken, async (req, res) => {
  try {
    let { month, year } = req.query;
    month = parseInt(month);
    year = parseInt(year);

    if (isNaN(month) || month < 1 || month > 12) {
      return res.status(400).json({ message: 'Invalid month parameter' });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // 1. Get all attendance records for the employee in the month
    const attendance = await Attendance.find({
      employeeId: req.params.employeeId,
      date: { $gte: startDate, $lte: endDate }
    });

    // 2. Get all working days in the month
    const workingDays = getWorkingDays(year, month);

    // 3. Map attendance by date (YYYY-MM-DD)
    const attendanceMap = {};
    attendance.forEach(a => {
      const day = a.date.toISOString().split('T')[0];
      attendanceMap[day] = a;
    });

    let present = 0, leave = 0, absent = 0;
    workingDays.forEach(day => {
      const dayStr = day.toISOString().split('T')[0];
      const record = attendanceMap[dayStr];
      if (record) {
        if (record.status === 'leave') leave++;
        else if (record.status === 'present' && record.checkIn && record.checkOut) present++;
      } else {
        absent++;
      }
    });

    const summary = {
      month: new Date(startDate).toLocaleString('default', { month: 'long' }),
      year,
      present,
      absent,
      leave,
      total: workingDays.length
    };

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get detailed attendance history for an employee
router.get('/history/:employeeId', verifyToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { employeeId: req.params.employeeId };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendance = await Attendance.find(query)
      .sort({ date: -1 })
      .populate('shop', 'name')
      .populate('employeeId', 'firstName lastName');

    // Format the response
    const formattedAttendance = attendance.map(record => {
      // Format checkIn and checkOut as objects with a time property
      const checkInObj = record.checkIn
        ? { time: new Date(record.checkIn).toTimeString().split(' ')[0] }
        : null;
      const checkOutObj = record.checkOut
        ? { time: new Date(record.checkOut).toTimeString().split(' ')[0] }
        : null;

      return {
        id: record._id,
        date: record.date.toISOString().split('T')[0],
        checkIn: checkInObj,
        checkOut: checkOutObj,
        status: record.status,
        shop: record.shop?.name,
        employee: record.employeeId ? {
          firstName: record.employeeId.firstName,
          lastName: record.employeeId.lastName
        } : null
      };
    });

    res.json(formattedAttendance);
  } catch (error) {
    console.error('Attendance history error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 