const express = require('express');
const router = express.Router();
const Shop = require('../models/Shop');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Payroll = require('../models/Payroll');
const { verifyToken, checkRole } = require('../middleware/auth');

// Helper function to get today's date range
const getTodayDateRange = () => {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  return { today, tomorrow };
};

// Get dashboard statistics (admin only)
router.get('/stats', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    // Get total number of shops
    const totalShops = await Shop.countDocuments();

    // Get total number of employees
    const totalEmployees = await Employee.countDocuments();

    // Get total payroll amount for the current month
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const totalPayroll = await Payroll.aggregate([
      {
        $match: {
          date: {
            $gte: firstDayOfMonth,
            $lte: lastDayOfMonth
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$netSalary' }
        }
      }
    ]);

    // Calculate average attendance rate for the current month
    const attendanceStats = await Attendance.aggregate([
      {
        $match: {
          date: {
            $gte: firstDayOfMonth,
            $lte: lastDayOfMonth
          }
        }
      },
      {
        $group: {
          _id: null,
          totalDays: { $sum: 1 },
          presentDays: {
            $sum: {
              $cond: [{ $eq: ['$status', 'present'] }, 1, 0]
            }
          }
        }
      }
    ]);

    const averageAttendance = attendanceStats.length > 0
      ? (attendanceStats[0].presentDays / attendanceStats[0].totalDays) * 100
      : 0;

    res.json({
      totalShops,
      totalEmployees,
      totalPayroll: totalPayroll.length > 0 ? totalPayroll[0].total : 0,
      averageAttendance
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get client dashboard statistics
router.get('/client-stats', verifyToken, checkRole(['client']), async (req, res) => {
  try {
    const shopId = req.query.shopId;
    if (!shopId) {
      return res.status(400).json({ error: 'Shop ID is required' });
    }

    // Get total number of employees for this shop
    const totalEmployees = await Employee.countDocuments({ shop: shopId });

    // Get present employees today
    const { today, tomorrow } = getTodayDateRange();
    const presentToday = await Attendance.countDocuments({
      shop: shopId,
      date: { $gte: today, $lt: tomorrow },
      status: 'present'
    });

    // Get pending payroll for current month
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const pendingPayroll = await Payroll.aggregate([
      {
        $match: {
          shop: shopId,
          date: { $gte: firstDayOfMonth, $lte: lastDayOfMonth },
          status: 'pending'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$netSalary' }
        }
      }
    ]);

    // Get total number of shops owned by this client
    const totalShops = await Shop.countDocuments({ owner: req.userId });

    res.json({
      totalEmployees,
      presentToday,
      pendingPayroll: pendingPayroll.length > 0 ? pendingPayroll[0].total : 0,
      totalShops
    });
  } catch (error) {
    console.error('Client dashboard stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get employee dashboard statistics
router.get('/employee-stats', verifyToken, checkRole(['employee']), async (req, res) => {
  try {
    const employeeId = req.userId;

    // Get attendance stats for current month
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const attendanceStats = await Attendance.aggregate([
      {
        $match: {
          employee: employeeId,
          date: {
            $gte: firstDayOfMonth,
            $lte: lastDayOfMonth
          }
        }
      },
      {
        $group: {
          _id: null,
          present: {
            $sum: {
              $cond: [{ $eq: ['$status', 'present'] }, 1, 0]
            }
          },
          absent: {
            $sum: {
              $cond: [{ $eq: ['$status', 'absent'] }, 1, 0]
            }
          },
          late: {
            $sum: {
              $cond: [{ $eq: ['$status', 'late'] }, 1, 0]
            }
          }
        }
      }
    ]);

    // Get payslip stats
    const payslipStats = await Payroll.aggregate([
      {
        $match: {
          employee: employeeId
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: {
            $sum: {
              $cond: [{ $eq: ['$status', 'pending'] }, 1, 0]
            }
          },
          approved: {
            $sum: {
              $cond: [{ $eq: ['$status', 'approved'] }, 1, 0]
            }
          }
        }
      }
    ]);

    res.json({
      attendance: attendanceStats.length > 0 ? attendanceStats[0] : { present: 0, absent: 0, late: 0 },
      payslips: payslipStats.length > 0 ? payslipStats[0] : { total: 0, pending: 0, approved: 0 }
    });
  } catch (error) {
    console.error('Employee dashboard stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 