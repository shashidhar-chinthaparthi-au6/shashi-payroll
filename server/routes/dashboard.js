const express = require('express');
const router = express.Router();
const Shop = require('../models/Shop');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Payroll = require('../models/Payroll');
const { verifyToken, checkRole } = require('../middleware/auth');

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

module.exports = router; 