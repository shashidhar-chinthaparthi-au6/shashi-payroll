const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

const User = require('../models/User');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Payslip = require('../models/Payslip');
const Leave = require('../models/Leave');
const Activity = require('../models/Activity');
const STATUS = require('../utils/constants/statusCodes');
const MSG = require('../utils/constants/messages');
const { verifyToken, checkRole, populateUser } = require('../middleware/auth');

// All client routes require client role
router.use(verifyToken, populateUser, checkRole(['client']));

// Get client dashboard data
router.get('/dashboard', async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    
    // Get organization statistics
    const [
      totalEmployees,
      totalContractors,
      presentToday,
      pendingLeaves,
      totalPayslips
    ] = await Promise.all([
      Employee.countDocuments({ organizationId }),
      Employee.countDocuments({ organizationId, type: 'contractor' }),
      Attendance.countDocuments({ 
        date: { 
          $gte: new Date(new Date().setHours(0,0,0,0)),
          $lt: new Date(new Date().setHours(23,59,59,999))
        },
        checkIn: { $exists: true }
      }),
      Leave.countDocuments({ status: 'pending' }),
      Payslip.countDocuments()
    ]);

    const dashboardData = {
      totalEmployees,
      totalContractors,
      presentToday,
      pendingLeaves,
      totalPayslips,
      attendanceRate: totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 0
    };

    return res.status(STATUS.OK).json({ 
      data: dashboardData, 
      message: MSG.SUCCESS || 'Success' 
    });
  } catch (error) {
    console.error('Client dashboard error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// Get organization activities
router.get('/activities', async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    
    // Get recent activities for the organization
    const activities = await Activity.find({ 
      'meta.organizationId': organizationId 
    })
      .populate('actor', 'name')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const formattedActivities = activities.map(activity => ({
      _id: activity._id,
      type: activity.type,
      action: activity.action,
      actor: activity.actor?._id,
      actorName: activity.actor?.name || 'System',
      meta: activity.meta,
      createdAt: activity.createdAt
    }));

    return res.status(STATUS.OK).json({
      data: formattedActivities,
      message: MSG.SUCCESS || 'Success'
    });
  } catch (error) {
    console.error('Get organization activities error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// Get organization employees
router.get('/employees', async (req, res) => {
  try {
    const employees = await Employee.find({ organizationId: req.user.organizationId })
      .populate('userId', 'name email')
      .lean();

    const formattedEmployees = employees.map(emp => ({
      _id: emp._id,
      name: emp.name || emp.userId?.name,
      email: emp.email || emp.userId?.email,
      phone: emp.phone,
      position: emp.position,
      department: emp.department,
      salary: emp.salary,
      employmentType: emp.employmentType,
      status: emp.status,
      hireDate: emp.hireDate,
      manager: emp.manager
    }));

    return res.status(STATUS.OK).json({
      data: formattedEmployees,
      message: MSG.SUCCESS || 'Success'
    });
  } catch (error) {
    console.error('Get organization employees error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// Create organization employee
router.post('/employees', async (req, res) => {
  try {
    const { name, email, phone, position, department, salary, employmentType, status } = req.body;

    // Create user account
    const user = new User({
      name,
      email,
      password: await bcrypt.hash('password123', 10), // Default password
      role: 'employee',
      organizationId: req.user.organizationId
    });

    await user.save();

    // Create employee record
    const employee = new Employee({
      userId: user._id,
      name,
      email,
      phone,
      position,
      department,
      salary,
      employmentType: employmentType || 'full-time',
      status: status || 'active',
      organizationId: req.user.organizationId,
      hireDate: new Date()
    });

    await employee.save();

    return res.status(STATUS.OK).json({
      data: employee,
      message: MSG.SUCCESS || 'Employee created successfully'
    });
  } catch (error) {
    console.error('Create organization employee error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// Update organization employee
router.put('/employees/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const employee = await Employee.findOneAndUpdate(
      { _id: id, organizationId: req.user.organizationId },
      updateData,
      { new: true }
    );

    if (!employee) {
      return res.status(STATUS.NOT_FOUND).json({ message: MSG.NOT_FOUND || 'Employee not found' });
    }

    return res.status(STATUS.OK).json({
      data: employee,
      message: MSG.SUCCESS || 'Employee updated successfully'
    });
  } catch (error) {
    console.error('Update organization employee error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// Delete organization employee
router.delete('/employees/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findOneAndDelete({
      _id: id,
      organizationId: req.user.organizationId
    });

    if (!employee) {
      return res.status(STATUS.NOT_FOUND).json({ message: MSG.NOT_FOUND || 'Employee not found' });
    }

    // Also delete the associated user
    if (employee.userId) {
      await User.findByIdAndDelete(employee.userId);
    }

    return res.status(STATUS.OK).json({
      message: MSG.SUCCESS || 'Employee deleted successfully'
    });
  } catch (error) {
    console.error('Delete organization employee error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// Get organization contractors
router.get('/contractors', async (req, res) => {
  try {
    const contractors = await Employee.find({ 
      organizationId: req.user.organizationId,
      employmentType: 'contract'
    })
      .populate('userId', 'name email')
      .lean();

    const formattedContractors = contractors.map(contractor => ({
      _id: contractor._id,
      name: contractor.name || contractor.userId?.name,
      email: contractor.email || contractor.userId?.email,
      phone: contractor.phone,
      position: contractor.position,
      department: contractor.department,
      rateAmount: contractor.salary, // Using salary as rate
      rateType: 'hourly', // Default rate type
      status: contractor.status,
      totalHours: Math.floor(Math.random() * 200) + 50, // Mock data
      totalRevenue: contractor.salary * (Math.floor(Math.random() * 200) + 50), // Mock data
      activeContracts: Math.floor(Math.random() * 3) + 1 // Mock data
    }));

    return res.status(STATUS.OK).json({
      data: formattedContractors,
      message: MSG.SUCCESS || 'Success'
    });
  } catch (error) {
    console.error('Get organization contractors error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// Create organization contractor
router.post('/contractors', async (req, res) => {
  try {
    const { name, email, phone, position, department, rateAmount, rateType, status } = req.body;

    // Create user account
    const user = new User({
      name,
      email,
      password: await bcrypt.hash('password123', 10), // Default password
      role: 'employee',
      organizationId: req.user.organizationId
    });

    await user.save();

    // Create contractor record
    const contractor = new Employee({
      userId: user._id,
      name,
      email,
      phone,
      position,
      department,
      salary: rateAmount, // Using salary field for rate
      employmentType: 'contract',
      status: status || 'active',
      organizationId: req.user.organizationId,
      hireDate: new Date()
    });

    await contractor.save();

    return res.status(STATUS.OK).json({
      data: contractor,
      message: MSG.SUCCESS || 'Contractor created successfully'
    });
  } catch (error) {
    console.error('Create organization contractor error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// Update organization contractor
router.put('/contractors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const contractor = await Employee.findOneAndUpdate(
      { _id: id, organizationId: req.user.organizationId },
      updateData,
      { new: true }
    );

    if (!contractor) {
      return res.status(STATUS.NOT_FOUND).json({ message: MSG.NOT_FOUND || 'Contractor not found' });
    }

    return res.status(STATUS.OK).json({
      data: contractor,
      message: MSG.SUCCESS || 'Contractor updated successfully'
    });
  } catch (error) {
    console.error('Update organization contractor error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// Delete organization contractor
router.delete('/contractors/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const contractor = await Employee.findOneAndDelete({
      _id: id,
      organizationId: req.user.organizationId
    });

    if (!contractor) {
      return res.status(STATUS.NOT_FOUND).json({ message: MSG.NOT_FOUND || 'Contractor not found' });
    }

    // Also delete the associated user
    if (contractor.userId) {
      await User.findByIdAndDelete(contractor.userId);
    }

    return res.status(STATUS.OK).json({
      message: MSG.SUCCESS || 'Contractor deleted successfully'
    });
  } catch (error) {
    console.error('Delete organization contractor error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// Get organization attendance records
router.get('/attendance', async (req, res) => {
  try {
    const attendanceRecords = await Attendance.find({ organizationId: req.user.organizationId })
      .populate('employee', 'name employeeId')
      .populate('approvedBy', 'name')
      .sort({ date: -1, createdAt: -1 })
      .lean();

    const formattedRecords = attendanceRecords.map(record => ({
      _id: record._id,
      employeeName: record.employee?.name || 'Unknown',
      employeeId: record.employee?.employeeId || 'N/A',
      date: record.date,
      checkIn: record.checkIn?.time || record.checkIn,
      checkOut: record.checkOut?.time || record.checkOut,
      status: record.status,
      workingHours: record.workingHours || 0,
      overtimeHours: record.overtimeHours || 0,
      notes: record.notes,
      approvedBy: record.approvedBy?.name,
      approvedAt: record.approvedAt,
      createdAt: record.createdAt
    }));

    return res.status(STATUS.OK).json({
      data: formattedRecords,
      message: MSG.SUCCESS || 'Success'
    });
  } catch (error) {
    console.error('Get organization attendance error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// Approve attendance record
router.put('/attendance/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;

    const attendance = await Attendance.findOneAndUpdate(
      { _id: id, organizationId: req.user.organizationId },
      { 
        status: 'approved',
        approvedBy: req.user._id,
        approvedAt: new Date()
      },
      { new: true }
    );

    if (!attendance) {
      return res.status(STATUS.NOT_FOUND).json({ message: MSG.NOT_FOUND || 'Attendance record not found' });
    }

    return res.status(STATUS.OK).json({
      data: attendance,
      message: MSG.SUCCESS || 'Attendance approved successfully'
    });
  } catch (error) {
    console.error('Approve attendance error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// Reject attendance record
router.put('/attendance/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const attendance = await Attendance.findOneAndUpdate(
      { _id: id, organizationId: req.user.organizationId },
      { 
        status: 'rejected',
        approvedBy: req.user._id,
        approvedAt: new Date(),
        rejectionReason: reason
      },
      { new: true }
    );

    if (!attendance) {
      return res.status(STATUS.NOT_FOUND).json({ message: MSG.NOT_FOUND || 'Attendance record not found' });
    }

    return res.status(STATUS.OK).json({
      data: attendance,
      message: MSG.SUCCESS || 'Attendance rejected successfully'
    });
  } catch (error) {
    console.error('Reject attendance error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// Get organization payroll records
router.get('/payroll', async (req, res) => {
  try {
    const payrollRecords = await Payslip.find({ organizationId: req.user.organizationId })
      .populate('employee', 'name employeeId')
      .populate('approvedBy', 'name')
      .sort({ year: -1, month: -1, createdAt: -1 })
      .lean();

    const formattedRecords = payrollRecords.map(record => ({
      _id: record._id,
      employeeName: record.employee?.name || 'Unknown',
      employeeId: record.employee?.employeeId || 'N/A',
      month: record.month,
      year: record.year,
      basicSalary: record.basicSalary,
      allowances: record.allowances,
      deductions: record.deductions,
      grossSalary: record.grossSalary,
      totalDeductions: record.totalDeductions,
      netSalary: record.netSalary,
      status: record.status,
      generatedAt: record.generatedAt,
      approvedAt: record.approvedAt,
      approvedBy: record.approvedBy?.name
    }));

    return res.status(STATUS.OK).json({
      data: formattedRecords,
      message: MSG.SUCCESS || 'Success'
    });
  } catch (error) {
    console.error('Get organization payroll error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// Generate payroll for organization
router.post('/payroll/generate', async (req, res) => {
  try {
    const { month, year, includeContractors } = req.body;

    // Get all employees for the organization
    const employees = await Employee.find({ 
      organizationId: req.user.organizationId,
      status: 'active'
    });

    if (includeContractors) {
      // Include contractors if specified
      const contractors = await Employee.find({ 
        organizationId: req.user.organizationId,
        employmentType: 'contract',
        status: 'active'
      });
      employees.push(...contractors);
    }

    const generatedPayrolls = [];

    for (const employee of employees) {
      // Calculate basic salary
      const basicSalary = employee.salary || 0;
      
      // Get attendance for the month
      const attendance = await Attendance.find({
        employee: employee._id,
        organizationId: req.user.organizationId,
        date: {
          $gte: new Date(year, month - 1, 1),
          $lt: new Date(year, month, 1)
        }
      });

      const presentDays = attendance.filter(a => a.status === 'present').length;
      const workingDays = new Date(year, month, 0).getDate(); // Days in the month
      const overtimeHours = attendance.reduce((sum, a) => sum + (a.overtimeHours || 0), 0);

      // Calculate allowances (mock data)
      const allowances = [
        { name: 'Housing Allowance', amount: Math.round(basicSalary * 0.1) },
        { name: 'Transport Allowance', amount: Math.round(basicSalary * 0.05) },
        { name: 'Overtime', amount: Math.round(overtimeHours * (basicSalary / 30 / 8) * 1.5) }
      ];

      // Calculate deductions (mock data)
      const deductions = [
        { name: 'Income Tax', amount: Math.round(basicSalary * 0.1) },
        { name: 'Provident Fund', amount: Math.round(basicSalary * 0.12) },
        { name: 'Health Insurance', amount: 500 }
      ];

      const totalAllowances = allowances.reduce((sum, a) => sum + a.amount, 0);
      const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);
      const grossSalary = basicSalary + totalAllowances;
      const netSalary = grossSalary - totalDeductions;

      // Create payslip
      const payslip = new Payslip({
        employee: employee._id,
        organizationId: req.user.organizationId,
        month,
        year,
        basicSalary,
        allowances,
        deductions,
        grossSalary,
        totalDeductions,
        netSalary,
        attendance: {
          workingDays,
          presentDays,
          overtimeHours
        },
        status: 'pending',
        generatedAt: new Date()
      });

      await payslip.save();
      generatedPayrolls.push(payslip);
    }

    return res.status(STATUS.OK).json({
      data: generatedPayrolls,
      message: MSG.SUCCESS || `Payroll generated for ${generatedPayrolls.length} employees`
    });
  } catch (error) {
    console.error('Generate payroll error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// Approve payroll record
router.put('/payroll/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;

    const payroll = await Payslip.findOneAndUpdate(
      { _id: id, organizationId: req.user.organizationId },
      { 
        status: 'approved',
        approvedBy: req.user._id,
        approvedAt: new Date()
      },
      { new: true }
    );

    if (!payroll) {
      return res.status(STATUS.NOT_FOUND).json({ message: MSG.NOT_FOUND || 'Payroll record not found' });
    }

    return res.status(STATUS.OK).json({
      data: payroll,
      message: MSG.SUCCESS || 'Payroll approved successfully'
    });
  } catch (error) {
    console.error('Approve payroll error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// Reject payroll record
router.put('/payroll/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const payroll = await Payslip.findOneAndUpdate(
      { _id: id, organizationId: req.user.organizationId },
      { 
        status: 'rejected',
        approvedBy: req.user._id,
        approvedAt: new Date(),
        rejectionReason: reason
      },
      { new: true }
    );

    if (!payroll) {
      return res.status(STATUS.NOT_FOUND).json({ message: MSG.NOT_FOUND || 'Payroll record not found' });
    }

    return res.status(STATUS.OK).json({
      data: payroll,
      message: MSG.SUCCESS || 'Payroll rejected successfully'
    });
  } catch (error) {
    console.error('Reject payroll error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// Mark payroll as paid
router.put('/payroll/:id/mark-paid', async (req, res) => {
  try {
    const { id } = req.params;

    const payroll = await Payslip.findOneAndUpdate(
      { _id: id, organizationId: req.user.organizationId },
      { 
        status: 'paid',
        paidAt: new Date()
      },
      { new: true }
    );

    if (!payroll) {
      return res.status(STATUS.NOT_FOUND).json({ message: MSG.NOT_FOUND || 'Payroll record not found' });
    }

    return res.status(STATUS.OK).json({
      data: payroll,
      message: MSG.SUCCESS || 'Payroll marked as paid successfully'
    });
  } catch (error) {
    console.error('Mark payroll as paid error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// Get organization leave requests
router.get('/leaves', async (req, res) => {
  try {
    const leaveRequests = await Leave.find({ organizationId: req.user.organizationId })
      .populate('employee', 'name employeeId')
      .populate('approvedBy', 'name')
      .sort({ appliedAt: -1 })
      .lean();

    const formattedRequests = leaveRequests.map(request => ({
      _id: request._id,
      employeeName: request.employee?.name || 'Unknown',
      employeeId: request.employee?.employeeId || 'N/A',
      leaveType: request.type,
      startDate: request.startDate,
      endDate: request.endDate,
      days: request.days,
      reason: request.reason,
      status: request.status || 'pending',
      appliedAt: request.appliedAt,
      approvedAt: request.approvedAt,
      approvedBy: request.approvedBy?.name,
      rejectionReason: request.rejectionReason,
      attachments: request.attachments || []
    }));

    return res.status(STATUS.OK).json({
      data: formattedRequests,
      message: MSG.SUCCESS || 'Success'
    });
  } catch (error) {
    console.error('Get organization leaves error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// Approve leave request
router.put('/leaves/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;

    const leave = await Leave.findOneAndUpdate(
      { _id: id, organizationId: req.user.organizationId },
      { 
        status: 'approved',
        approvedBy: req.user._id,
        approvedAt: new Date()
      },
      { new: true }
    );

    if (!leave) {
      return res.status(STATUS.NOT_FOUND).json({ message: MSG.NOT_FOUND || 'Leave request not found' });
    }

    return res.status(STATUS.OK).json({
      data: leave,
      message: MSG.SUCCESS || 'Leave request approved successfully'
    });
  } catch (error) {
    console.error('Approve leave error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// Reject leave request
router.put('/leaves/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    const leave = await Leave.findOneAndUpdate(
      { _id: id, organizationId: req.user.organizationId },
      { 
        status: 'rejected',
        approvedBy: req.user._id,
        approvedAt: new Date(),
        rejectionReason
      },
      { new: true }
    );

    if (!leave) {
      return res.status(STATUS.NOT_FOUND).json({ message: MSG.NOT_FOUND || 'Leave request not found' });
    }

    return res.status(STATUS.OK).json({
      data: leave,
      message: MSG.SUCCESS || 'Leave request rejected successfully'
    });
  } catch (error) {
    console.error('Reject leave error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// Get organization reports
router.post('/reports', async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    const organizationId = req.user.organizationId;

    // Get employee statistics
    const totalEmployees = await Employee.countDocuments({ organizationId });
    const activeEmployees = await Employee.countDocuments({ organizationId, status: 'active' });
    const onLeaveEmployees = await Employee.countDocuments({ organizationId, status: 'on_leave' });
    const newHires = await Employee.countDocuments({ 
      organizationId, 
      hireDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
    });

    // Get attendance statistics
    const attendanceRecords = await Attendance.find({
      organizationId,
      date: { $gte: new Date(startDate), $lte: new Date(endDate) }
    });

    const presentCount = attendanceRecords.filter(a => a.status === 'present').length;
    const absentCount = attendanceRecords.filter(a => a.status === 'absent').length;
    const lateCount = attendanceRecords.filter(a => a.status === 'late').length;
    const averageRate = totalEmployees > 0 ? Math.round((presentCount / (presentCount + absentCount)) * 100) : 0;

    // Get today's attendance
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAttendance = await Attendance.find({
      organizationId,
      date: { $gte: today, $lt: tomorrow }
    });

    const presentToday = todayAttendance.filter(a => a.status === 'present').length;
    const absentToday = todayAttendance.filter(a => a.status === 'absent').length;
    const lateToday = todayAttendance.filter(a => a.status === 'late').length;

    // Get payroll statistics
    const payrollRecords = await Payslip.find({
      organizationId,
      generatedAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
    });

    const totalAmount = payrollRecords.reduce((sum, p) => sum + (p.netSalary || 0), 0);
    const pendingAmount = payrollRecords
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + (p.netSalary || 0), 0);
    const paidAmount = payrollRecords
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + (p.netSalary || 0), 0);
    const averageSalary = totalEmployees > 0 ? Math.round(totalAmount / totalEmployees) : 0;

    // Get leave statistics
    const leaveRequests = await Leave.find({
      organizationId,
      appliedAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
    });

    const totalRequests = leaveRequests.length;
    const pendingRequests = leaveRequests.filter(l => l.status === 'pending').length;
    const approvedRequests = leaveRequests.filter(l => l.status === 'approved').length;
    const rejectedRequests = leaveRequests.filter(l => l.status === 'rejected').length;

    // Get contractor statistics
    const contractors = await Employee.find({
      organizationId,
      employmentType: 'contract'
    });

    const totalContractors = contractors.length;
    const activeContractors = contractors.filter(c => c.status === 'active').length;
    const totalHours = Math.floor(Math.random() * 1000) + 500; // Mock data
    const totalRevenue = contractors.reduce((sum, c) => sum + (c.salary || 0) * (Math.floor(Math.random() * 50) + 10), 0);

    const reportData = {
      employees: {
        total: totalEmployees,
        active: activeEmployees,
        onLeave: onLeaveEmployees,
        newHires: newHires
      },
      attendance: {
        averageRate: averageRate,
        presentToday: presentToday,
        absentToday: absentToday,
        lateToday: lateToday
      },
      payroll: {
        totalAmount: totalAmount,
        pendingAmount: pendingAmount,
        paidAmount: paidAmount,
        averageSalary: averageSalary
      },
      leaves: {
        totalRequests: totalRequests,
        pendingRequests: pendingRequests,
        approvedRequests: approvedRequests,
        rejectedRequests: rejectedRequests
      },
      contractors: {
        total: totalContractors,
        active: activeContractors,
        totalHours: totalHours,
        totalRevenue: totalRevenue
      }
    };

    return res.status(STATUS.OK).json({
      data: reportData,
      message: MSG.SUCCESS || 'Report generated successfully'
    });
  } catch (error) {
    console.error('Get organization reports error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// Export organization reports
router.post('/reports/export', async (req, res) => {
  try {
    const { format, startDate, endDate } = req.body;

    // Mock export functionality
    const exportData = {
      format,
      startDate,
      endDate,
      generatedAt: new Date(),
      downloadUrl: `/exports/report_${Date.now()}.${format}`
    };

    return res.status(STATUS.OK).json({
      data: exportData,
      message: MSG.SUCCESS || 'Report export initiated successfully'
    });
  } catch (error) {
    console.error('Export organization reports error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

module.exports = router;
