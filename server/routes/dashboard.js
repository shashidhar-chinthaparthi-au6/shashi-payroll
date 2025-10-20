const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Organization = require('../models/Organization');
const Payroll = require('../models/Payroll');
const ContractAssignment = require('../models/ContractAssignment');
const Leave = require('../models/Leave');
const Activity = require('../models/Activity');
const STATUS = require('../utils/constants/statusCodes');
const MSG = require('../utils/constants/messages');
const { verifyToken, checkRole, populateUser } = require('../middleware/auth');

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
    const totalOrganizations = await Organization.countDocuments({});

    const activeContracts = await ContractAssignment.countDocuments({ status: 'active' });

    // Calculate pending approvals from multiple sources
    const [pendingPayrolls, pendingLeaves, pendingContracts] = await Promise.all([
      Payroll.countDocuments({ status: 'pending' }),
      Leave.countDocuments({ status: 'pending' }),
      ContractAssignment.countDocuments({ status: 'pending' })
    ]);
    const pendingApprovals = pendingPayrolls + pendingLeaves + pendingContracts;

    // Calculate system health based on various metrics
    const activeEmployees = await Employee.countDocuments({ status: 'active' });
    const recentActivities = await Activity.countDocuments({ 
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
    });
    
    // Health calculation factors
    const employeeHealth = totalEmployees > 0 ? (activeEmployees / totalEmployees) * 100 : 100;
    const activityHealth = recentActivities > 0 ? Math.min(100, (recentActivities / 10) * 100) : 50; // Normalize activity
    const systemHealth = Math.round((employeeHealth + activityHealth) / 2);

    return res.status(STATUS.OK).json({
      data: {
        totalOrganizations,
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
router.get('/client', verifyToken, populateUser, checkRole(['client']), async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    
    if (!organizationId) {
      return res.status(STATUS.BAD_REQUEST).json({ message: 'Organization ID not found' });
    }

    const totalEmployees = await Employee.countDocuments({ organizationId });

    const { today, tomorrow } = getTodayDateRange();
    const presentToday = await Attendance.countDocuments({
      organizationId,
      date: { $gte: today, $lt: tomorrow },
      status: 'present',
    });

    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const pendingPayroll = await Payroll.countDocuments({ 
      organizationId,
      status: 'pending', 
      date: { $gte: firstDayOfMonth, $lte: lastDayOfMonth } 
    });

    const pendingLeaves = await Leave.countDocuments({ 
      organizationId,
      status: 'pending' 
    });

    const monthlyExpenseAgg = await Payroll.aggregate([
      { $match: { 
        organizationId,
        date: { $gte: firstDayOfMonth, $lte: lastDayOfMonth } 
      }},
      { $group: { _id: null, total: { $sum: '$netSalary' } } },
    ]);
    const monthlyExpense = monthlyExpenseAgg.length > 0 ? monthlyExpenseAgg[0].total : 0;

    // Calculate attendance rate
    const totalAttendanceRecords = await Attendance.countDocuments({
      organizationId,
      date: { $gte: today, $lt: tomorrow }
    });
    const attendanceRate = totalAttendanceRecords > 0 ? Math.round((presentToday / totalAttendanceRecords) * 100) : 0;

    return res.status(STATUS.OK).json({
      data: {
        totalEmployees,
        totalContractors: await Employee.countDocuments({ 
          organizationId,
          employmentType: 'contract' 
        }),
        presentToday,
        pendingPayroll,
        pendingLeaves,
        monthlyExpense,
        attendanceRate
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