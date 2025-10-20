const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { verifyToken, checkRole } = require('../middleware/auth');

// Helper function to format date
const formatDate = (date) => {
  if (!date) return null;
  try {
    return new Date(date).toISOString();
  } catch (error) {
    console.error('Date formatting error:', error);
    return null;
  }
};

// Helper function to validate date
const isValidDate = (date) => {
  if (!date) return false;
  const parsedDate = new Date(date);
  return !isNaN(parsedDate.getTime());
};

// Helper function to validate attendance status
const validateAttendanceStatus = (status, checkIn, checkOut) => {
  if (status === 'present') {
    if (!checkIn || !checkIn.time) {
      return false;
    }
  }
  if (status === 'absent') {
    if (checkIn || checkOut) {
      return false;
    }
  }
  if (status === 'half-day') {
    if (!checkIn || !checkIn.time) {
      return false;
    }
  }
  return true;
};

// Manual check-in
router.post('/check-in', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    console.log('Check-in request:', { userId });

    // Check if already checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    console.log('Date range for check-in:', { today, tomorrow });
    
    const existingAttendance = await Attendance.findOne({
      userId,
      date: {
        $gte: today,
        $lt: tomorrow
      }
    });

    if (existingAttendance) {
      return res.status(400).json({ message: 'Already checked in today' });
    }

    const checkInTime = new Date();
    const attendance = new Attendance({
      userId,
      date: today,
      checkIn: {
        time: checkInTime,
        method: 'manual'
      },
      status: 'present'
    });

    await attendance.save();
    console.log(attendance);
    // Format the response
    const formattedAttendance = {
      id: attendance._id,
      date: formatDate(attendance.date),
      checkIn: attendance.checkIn ? {
        time: formatDate(attendance.checkIn.time),
        method: attendance.checkIn.method
      } : null,
      checkOut: null,
      status: attendance.status,
      user: null // Will be populated if needed
    };

    res.status(201).json(formattedAttendance);
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ message: error.message });
  }
});

// QR code check-in
router.post('/qr-check-in', verifyToken, async (req, res) => {
  try {
    const { userId } = req.body;
    
    // Validate user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const existingAttendance = await Attendance.findOne({
      userId,
      date: {
        $gte: today,
        $lt: tomorrow
      }
    });

    if (existingAttendance) {
      return res.status(400).json({ message: 'Already checked in today' });
    }

    const checkInTime = new Date();
    const attendance = new Attendance({
      userId,
      date: today,
      checkIn: {
        time: checkInTime,
        method: 'qr'
      },
      status: 'present',
      checkOut: null // Explicitly set checkOut to null
    });

    await attendance.save();

    // Format the response
    const formattedAttendance = {
      id: attendance._id,
      date: formatDate(attendance.date),
      checkIn: attendance.checkIn ? {
        time: formatDate(attendance.checkIn.time),
        method: attendance.checkIn.method
      } : null,
      checkOut: attendance.checkOut ? {
        time: formatDate(attendance.checkOut.time),
        method: attendance.checkOut.method
      } : null,
      status: attendance.status,
      user: {
        name: user.name,
        email: user.email
      }
    };

    res.status(201).json(formattedAttendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Check-out
router.post('/check-out', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { method = 'manual' } = req.body;
    console.log('Check-out request:', { userId, method });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    console.log('Date range for check-out:', { today, tomorrow });
    
    // Find attendance record using userId
    const attendance = await Attendance.findOne({
      userId,
      date: {
        $gte: today,
        $lt: tomorrow
      }
    });

    console.log("Current attendance record:", attendance);

    if (!attendance) {
      return res.status(404).json({ message: 'No check-in found for today' });
    }

    // Check if checkOut time exists
    if (attendance.checkOut && attendance.checkOut.time) {
      return res.status(400).json({ message: 'Already checked out today' });
    }

    if (!attendance.checkIn || !attendance.checkIn.time) {
      return res.status(400).json({ message: 'Invalid attendance record: missing check-in time' });
    }

    const checkOutTime = new Date();
    attendance.checkOut = {
      time: checkOutTime,
      method
    };

    await attendance.save();

    // Format the response
    const formattedAttendance = {
      id: attendance._id,
      date: formatDate(attendance.date),
      checkIn: attendance.checkIn ? {
        time: formatDate(attendance.checkIn.time),
        method: attendance.checkIn.method
      } : null,
      checkOut: attendance.checkOut ? {
        time: formatDate(attendance.checkOut.time),
        method: attendance.checkOut.method
      } : null,
      status: attendance.status,
      user: null // Will be populated if needed
    };

    res.json(formattedAttendance);
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get attendance logs for a user
router.get('/user/:userId', verifyToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { userId: req.params.userId };

    if (startDate && endDate) {
      if (!isValidDate(startDate) || !isValidDate(endDate)) {
        return res.status(400).json({ message: 'Invalid date format' });
      }
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendance = await Attendance.find(query)
      .sort({ date: -1 })
      .populate('userId', 'name email');

    // Format the response
    const formattedAttendance = attendance.map(record => {
      // Validate attendance record
      if (!validateAttendanceStatus(record.status, record.checkIn, record.checkOut)) {
        console.warn('Invalid attendance record:', record._id);
      }

      // Ensure checkIn and checkOut are properly formatted
      const formattedRecord = {
        id: record._id,
        date: formatDate(record.date),
        checkIn: null,
        checkOut: null,
        status: record.status,
        user: record.userId ? {
          name: record.userId.name,
          email: record.userId.email
        } : null
      };

      // Handle checkIn
      if (record.checkIn) {
        if (typeof record.checkIn === 'string') {
          // Convert string to object format
          formattedRecord.checkIn = {
            time: formatDate(record.checkIn),
            method: 'manual' // Default to manual if method is missing
          };
        } else if (record.checkIn.time) {
          formattedRecord.checkIn = {
            time: formatDate(record.checkIn.time),
            method: record.checkIn.method || 'manual'
          };
        }
      }

      // Handle checkOut
      if (record.checkOut) {
        if (typeof record.checkOut === 'string') {
          // Convert string to object format
          formattedRecord.checkOut = {
            time: formatDate(record.checkOut),
            method: 'manual' // Default to manual if method is missing
          };
        } else if (record.checkOut.time) {
          formattedRecord.checkOut = {
            time: formatDate(record.checkOut.time),
            method: record.checkOut.method || 'manual'
          };
        }
      }

      return formattedRecord;
    });

    res.json(formattedAttendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's attendance records
router.get('/user', verifyToken, checkRole(['employee']), async (req, res) => {
  try {
    const userId = req.userId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's attendance
    const todayAttendance = await Attendance.findOne({
      userId,
      date: {
        $gte: today,
        $lt: tomorrow
      }
    });

    // Get recent attendance history
    const attendanceHistory = await Attendance.find({ userId })
      .sort({ date: -1 })
      .limit(30)
      .lean();

    const formattedAttendance = attendanceHistory.map(record => {
      // Validate attendance record
      if (!validateAttendanceStatus(record.status, record.checkIn, record.checkOut)) {
        console.warn('Invalid attendance record:', record._id);
      }

      return {
        id: record._id,
        date: formatDate(record.date),
        checkIn: record.checkIn ? {
          time: formatDate(record.checkIn.time),
          method: record.checkIn.method
        } : null,
        checkOut: record.checkOut ? {
          time: formatDate(record.checkOut.time),
          method: record.checkOut.method
        } : null,
        status: record.status,
        notes: record.notes
      };
    });

    res.json({
      today: todayAttendance ? {
        id: todayAttendance._id,
        date: formatDate(todayAttendance.date),
        checkIn: todayAttendance.checkIn ? {
          time: formatDate(todayAttendance.checkIn.time),
          method: todayAttendance.checkIn.method
        } : null,
        checkOut: todayAttendance.checkOut ? {
          time: formatDate(todayAttendance.checkOut.time),
          method: todayAttendance.checkOut.method
        } : null,
        status: todayAttendance.status,
        notes: todayAttendance.notes
      } : null,
      history: formattedAttendance
    });
  } catch (error) {
    console.error('Error fetching user attendance:', error);
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

// Get monthly attendance summary for a user
router.get('/monthly-summary/:userId', verifyToken, async (req, res) => {
  try {
    let { month, year } = req.query;
    month = parseInt(month);
    year = parseInt(year);

    if (isNaN(month) || month < 1 || month > 12) {
      return res.status(400).json({ message: 'Invalid month parameter' });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // 1. Get all attendance records for the user in the month
    const attendance = await Attendance.find({
      userId: req.params.userId,
      date: { $gte: startDate, $lte: endDate }
    });

    // 2. Get all working days in the month
    const workingDays = getWorkingDays(year, month);

    // 3. Map attendance by date (YYYY-MM-DD)
    const attendanceMap = {};
    attendance.forEach(a => {
      const day = formatDate(a.date).split('T')[0];
      attendanceMap[day] = a;
    });

    let present = 0, leave = 0, absent = 0;
    workingDays.forEach(day => {
      const dayStr = formatDate(day).split('T')[0];
      const record = attendanceMap[dayStr];
      if (record) {
        if (record.status === 'leave') leave++;
        else if (record.status === 'present' && record.checkIn && record.checkIn.time) present++;
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

// Get detailed attendance history for a user
router.get('/history/:userId', verifyToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { userId: req.params.userId };

    if (startDate && endDate) {
      if (!isValidDate(startDate) || !isValidDate(endDate)) {
        return res.status(400).json({ message: 'Invalid date format' });
      }
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendance = await Attendance.find(query)
      .sort({ date: -1 })
      .populate('userId', 'name email');

    // Format the response
    const formattedAttendance = attendance.map(record => {
      // Validate attendance record
      if (!validateAttendanceStatus(record.status, record.checkIn, record.checkOut)) {
        console.warn('Invalid attendance record:', record._id);
      }
console.log(record);
      return {
        id: record._id,
        date: formatDate(record.date),
        checkIn: record.checkIn ? {
          time: formatDate(record.checkIn)
        } : null,
        checkOut: record.checkOut ? {
          time: formatDate(record.checkOut.time),
          method: record.checkOut.method
        } : null,
        status: record.status,
        user: record.userId ? {
          name: record.userId.name,
          email: record.userId.email
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