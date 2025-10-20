const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Payroll = require('../models/Payroll');
const STATUS = require('../utils/constants/statusCodes');
const MSG = require('../utils/constants/messages');
const { verifyToken, checkRole } = require('../middleware/auth');

// Helper function to get today's date range
const getTodayDateRange = () => {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  return { today, tomorrow };
};

// Admin dashboard statistics
router.get('/admin', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const [totalUsers, totalEmployees] = await Promise.all([
      User.countDocuments({}),
      Employee.countDocuments({}),
    ]);

    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const totalContractors = await Employee.countDocuments({ employmentType: 'contract' });

    const activeContracts = 0; // Placeholder until contracts feature is implemented

    const pendingApprovals = await Payroll.countDocuments({ status: 'pending' });

    const systemHealth = 95; // Placeholder health score

    return res.status(STATUS.OK).json({
      data: {
        totalOrganizations: 0, // Placeholder after removing shops/organizations
        totalUsers,
        totalContractors,
        activeContracts,
        pendingApprovals,
        systemHealth,
      },
      message: MSG.SUCCESS || 'Success',
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// Client (Org Manager) dashboard statistics
router.get('/client', verifyToken, checkRole(['client']), async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments({});

    const { today, tomorrow } = getTodayDateRange();
    const presentToday = await Attendance.countDocuments({
      date: { $gte: today, $lt: tomorrow },
      status: 'present',
    });

    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const pendingPayroll = await Payroll.countDocuments({ status: 'pending', date: { $gte: firstDayOfMonth, $lte: lastDayOfMonth } });

    const pendingLeaves = 0; // Placeholder until leave endpoints integrated

    const monthlyExpenseAgg = await Payroll.aggregate([
      { $match: { date: { $gte: firstDayOfMonth, $lte: lastDayOfMonth } } },
      { $group: { _id: null, total: { $sum: '$netSalary' } } },
    ]);
    const monthlyExpense = monthlyExpenseAgg.length > 0 ? monthlyExpenseAgg[0].total : 0;

    return res.status(STATUS.OK).json({
      data: {
        totalEmployees,
        totalContractors: await Employee.countDocuments({ employmentType: 'contract' }),
        presentToday,
        pendingPayroll,
        pendingLeaves,
        monthlyExpense,
      },
      message: MSG.SUCCESS || 'Success',
    });
  } catch (error) {
    console.error('Client dashboard error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// Employee dashboard statistics
router.get('/employee', verifyToken, checkRole(['employee']), async (req, res) => {
  try {
    const userId = req.userId;

    const employee = await Employee.findOne({ userId }).lean();
    const employeeId = employee?._id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const todayAttendance = employeeId
      ? await Attendance.findOne({ employee: employeeId, date: { $gte: today, $lt: tomorrow } }).lean()
      : null;

    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const monthlyPayslips = await Payroll.countDocuments({ employee: employeeId, date: { $gte: firstDayOfMonth, $lte: lastDayOfMonth } });

    return res.status(STATUS.OK).json({
      data: {
        todayStatus: todayAttendance?.status || 'not_checked',
        workingHours: todayAttendance?.workingHours || 0,
        monthlyPayslips,
        pendingLeaves: 0,
        totalLeaves: 0,
        nextPayslip: '',
      },
      message: MSG.SUCCESS || 'Success',
    });
  } catch (error) {
    console.error('Employee dashboard error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

module.exports = router;