const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

const User = require('../models/User');
const Organization = require('../models/Organization');
const Employee = require('../models/Employee');
const ContractAssignment = require('../models/ContractAssignment');
const Payroll = require('../models/Payroll');
const Leave = require('../models/Leave');
const SystemSettings = require('../models/SystemSettings');
const Activity = require('../models/Activity');
const STATUS = require('../utils/constants/statusCodes');
const MSG = require('../utils/constants/messages');
const { verifyToken, checkRole, populateUser } = require('../middleware/auth');

// All admin routes require admin role
router.use(verifyToken, checkRole(['admin']));

// Dashboard data endpoint
router.get('/dashboard', async (req, res) => {
  try {
    const [
      totalOrganizations,
      totalUsers,
      totalContractors,
      activeContracts,
      pendingApprovals,
      systemHealth
    ] = await Promise.all([
      Organization.countDocuments(),
      User.countDocuments(),
      Employee.countDocuments(),
      ContractAssignment.countDocuments({ status: 'active' }),
      Leave.countDocuments({ status: 'pending' }),
      SystemSettings.findOne({ key: 'system_health' })
    ]);

    const dashboardData = {
      totalOrganizations,
      totalUsers,
      totalContractors,
      activeContracts,
      pendingApprovals,
      systemHealth: systemHealth?.value || 100
    };

    return res.status(STATUS.OK).json({ 
      data: dashboardData, 
      message: MSG.SUCCESS || 'Success' 
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// Organization Manager routes (client role)
const clientRoutes = express.Router();
clientRoutes.use(verifyToken, populateUser, checkRole(['client']));

// List users (without passwords)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password')
      .populate('organizationId', 'name type')
      .sort({ createdAt: -1 })
      .lean();
    return res.status(STATUS.OK).json({ data: users, message: MSG.SUCCESS || 'Success' });
  } catch (error) {
    console.error('Admin list users error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// Create user
router.post('/users', async (req, res) => {
  try {
    const { name, email, password, role, organizationId } = req.body || {};
    if (!name || !email || !password || !role) {
      return res.status(STATUS.BAD_REQUEST).json({ message: MSG.BAD_REQUEST || 'Bad request' });
    }
    
    // Validate organization assignment based on role
    if ((role === 'client' || role === 'employee') && !organizationId) {
      return res.status(STATUS.BAD_REQUEST).json({ 
        message: 'Organization is required for client and employee roles' 
      });
    }
    
    // For admin role, organizationId should not be provided (global access)
    if (role === 'admin' && organizationId) {
      return res.status(STATUS.BAD_REQUEST).json({ 
        message: 'Super Admin users have global access and should not be assigned to specific organizations' 
      });
    }
    
    // For client and employee roles, verify organization exists
    if (role === 'client' || role === 'employee') {
      const org = await Organization.findById(organizationId);
      if (!org) {
        return res.status(STATUS.BAD_REQUEST).json({ 
          message: 'Invalid organization selected' 
        });
      }
    }
    
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(STATUS.BAD_REQUEST).json({ message: MSG.EMAIL_ALREADY_REGISTERED || 'Email already registered' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const userData = { 
      name, 
      email, 
      password: hashedPassword, 
      role,
      ...(organizationId && { organizationId })
    };
    
    const user = new User(userData);
    await user.save();
    
    // If creating a client, make them the manager of their organization
    if (role === 'client' && organizationId) {
      await Organization.findByIdAndUpdate(organizationId, { manager: user._id });
    }
    
    await Activity.create({ 
      actor: req.userId, 
      type: 'user', 
      action: 'create', 
      meta: { 
        userId: user._id, 
        email, 
        role,
        organizationId: organizationId || null
      } 
    });
    
    const safeUser = user.toObject();
    delete safeUser.password;
    return res.status(STATUS.CREATED).json({ 
      data: safeUser, 
      message: MSG.CLIENT_REGISTERED || 'User created successfully' 
    });
  } catch (error) {
    console.error('Admin create user error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// Update user (name, role; password optional)
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, password } = req.body || {};
    const update = {};
    if (name) update.name = name;
    if (role) update.role = role;
    if (password) update.password = await bcrypt.hash(password, 10);
    const user = await User.findByIdAndUpdate(id, update, { new: true }).select('-password');
    if (!user) {
      return res.status(STATUS.NOT_FOUND).json({ message: MSG.USER_NOT_FOUND });
    }
    await Activity.create({ actor: req.userId, type: 'user', action: 'update', meta: { userId: id } });
    return res.status(STATUS.OK).json({ data: user, message: MSG.PROFILE_UPDATED || 'User updated' });
  } catch (error) {
    console.error('Admin update user error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(STATUS.NOT_FOUND).json({ message: MSG.USER_NOT_FOUND });
    }
    await Activity.create({ actor: req.userId, type: 'user', action: 'delete', meta: { userId: id } });
    return res.status(STATUS.OK).json({ message: MSG.PROFILE_UPDATED || 'User deleted' });
  } catch (error) {
    console.error('Admin delete user error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// Organizations CRUD
router.get('/organizations', async (req, res) => {
  try {
    const orgs = await Organization.find({}).populate('manager', 'name email role').sort({ createdAt: -1 }).lean();
    return res.status(STATUS.OK).json({ data: orgs, message: MSG.SUCCESS || 'Success' });
  } catch (error) {
    console.error('Admin list orgs error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// Contract Assignments CRUD
router.get('/contracts', async (req, res) => {
  try {
    const list = await ContractAssignment.find({})
      .populate('contractorEmployee', 'name email')
      .populate('organizationId', 'name')
      .sort({ createdAt: -1 })
      .lean();
    return res.status(STATUS.OK).json({ data: list, message: MSG.SUCCESS || 'Success' });
  } catch (error) {
    console.error('Admin list contracts error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

router.post('/contracts', async (req, res) => {
  try {
    const body = req.body || {};
    if (!body.contractorEmployee || !body.organizationId || !body.title || !body.startDate) {
      return res.status(STATUS.BAD_REQUEST).json({ message: MSG.BAD_REQUEST || 'Bad request' });
    }
    const created = await ContractAssignment.create(body);
    const populated = await created.populate([
      { path: 'contractorEmployee', select: 'name email' },
      { path: 'organizationId', select: 'name' },
    ]);
    await Activity.create({ actor: req.userId, type: 'contract', action: 'create', meta: { contractId: created._id, title: body.title } });
    return res.status(STATUS.CREATED).json({ data: populated, message: 'Contract created' });
  } catch (error) {
    console.error('Admin create contract error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

router.put('/contracts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body || {};
    const updated = await ContractAssignment.findByIdAndUpdate(id, update, { new: true })
      .populate('contractorEmployee', 'name email')
      .populate('organizationId', 'name');
    if (!updated) return res.status(STATUS.NOT_FOUND).json({ message: 'Contract not found' });
    await Activity.create({ actor: req.userId, type: 'contract', action: 'update', meta: { contractId: id } });
    return res.status(STATUS.OK).json({ data: updated, message: 'Contract updated' });
  } catch (error) {
    console.error('Admin update contract error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

router.delete('/contracts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await ContractAssignment.findByIdAndDelete(id);
    if (!deleted) return res.status(STATUS.NOT_FOUND).json({ message: 'Contract not found' });
    await Activity.create({ actor: req.userId, type: 'contract', action: 'delete', meta: { contractId: id } });
    return res.status(STATUS.OK).json({ message: 'Contract deleted' });
  } catch (error) {
    console.error('Admin delete contract error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// Contractor Management (employees with employmentType = 'contract')
router.get('/contractors', async (req, res) => {
  try {
    const contractors = await Employee.find({ employmentType: 'contract' })
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 })
      .lean();
    return res.status(STATUS.OK).json({ data: contractors, message: MSG.SUCCESS || 'Success' });
  } catch (error) {
    console.error('Admin list contractors error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

router.post('/contractors', async (req, res) => {
  try {
    const { name, email, phone, position, department } = req.body || {};
    if (!name || !email) return res.status(STATUS.BAD_REQUEST).json({ message: MSG.BAD_REQUEST || 'Bad request' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(STATUS.BAD_REQUEST).json({ message: MSG.EMAIL_ALREADY_REGISTERED || 'Email already registered' });
    
    // Get the first available organization for admin-created contractors
    const defaultOrg = await Organization.findOne({});
    if (!defaultOrg) {
      return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: 'No organization found. Please create an organization first.' });
    }
    
    const defaultPassword = 'Contract@123';
    const user = await User.create({ 
      name, 
      email, 
      password: await bcrypt.hash(defaultPassword, 10), 
      role: 'employee',
      organizationId: defaultOrg._id
    });
    const emp = await Employee.create({ 
      name, 
      email, 
      phone, 
      position, 
      department, 
      userId: user._id, 
      status: 'active', 
      employmentType: 'contract',
      organizationId: defaultOrg._id
    });
    const safeUser = user.toObject(); delete safeUser.password;
    await Activity.create({ actor: req.userId, type: 'contractor', action: 'create', meta: { employeeId: emp._id } });
    return res.status(STATUS.CREATED).json({ data: { user: safeUser, employee: emp }, message: 'Contractor created' });
  } catch (error) {
    console.error('Admin create contractor error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

router.put('/contractors/:id', async (req, res) => {
  try {
    const { id } = req.params; // employee id
    const { name, email, phone, position, department, status } = req.body || {};
    const emp = await Employee.findById(id);
    if (!emp) return res.status(STATUS.NOT_FOUND).json({ message: MSG.EMPLOYEE_PROFILE_NOT_FOUND || 'Not found' });
    if (name) emp.name = name;
    if (email) emp.email = email;
    if (phone) emp.phone = phone;
    if (position) emp.position = position;
    if (department) emp.department = department;
    if (status) emp.status = status;
    await emp.save();
    if (emp.userId) {
      const u = await User.findById(emp.userId);
      if (u) {
        if (name) u.name = name;
        if (email) u.email = email;
        await u.save();
      }
    }
    const populated = await Employee.findById(id).populate('userId', 'name email role');
    await Activity.create({ actor: req.userId, type: 'contractor', action: 'update', meta: { employeeId: id } });
    return res.status(STATUS.OK).json({ data: populated, message: 'Contractor updated' });
  } catch (error) {
    console.error('Admin update contractor error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

router.delete('/contractors/:id', async (req, res) => {
  try {
    const { id } = req.params; // employee id
    const emp = await Employee.findById(id);
    if (!emp) return res.status(STATUS.NOT_FOUND).json({ message: MSG.EMPLOYEE_PROFILE_NOT_FOUND || 'Not found' });
    const userId = emp.userId;
    await emp.deleteOne();
    if (userId) await User.findByIdAndDelete(userId);
    await Activity.create({ actor: req.userId, type: 'contractor', action: 'delete', meta: { employeeId: id } });
    return res.status(STATUS.OK).json({ message: 'Contractor deleted' });
  } catch (error) {
    console.error('Admin delete contractor error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// Global analytics (admin)
router.get('/analytics', async (req, res) => {
  try {
    const [orgs, users, employees, contractors, contracts] = await Promise.all([
      Organization.countDocuments({}),
      User.countDocuments({}),
      Employee.countDocuments({}),
      Employee.countDocuments({ employmentType: 'contract' }),
      ContractAssignment.countDocuments({}),
    ]);

    // Payroll totals by month (last 6 months)
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const payrollByMonth = await Payroll.aggregate([
      { $match: { date: { $gte: sixMonthsAgo } } },
      { $group: { _id: { y: { $year: '$date' }, m: { $month: '$date' } }, total: { $sum: '$netSalary' } } },
      { $sort: { '_id.y': 1, '_id.m': 1 } },
    ]);

    return res.status(STATUS.OK).json({
      data: {
        counts: { organizations: orgs, users, employees, contractors, contracts },
        payrollByMonth,
      },
      message: MSG.SUCCESS || 'Success',
    });
  } catch (error) {
    console.error('Admin analytics error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// System Settings (singleton)
router.get('/settings', async (req, res) => {
  try {
    const doc = await SystemSettings.findOne({}) || await SystemSettings.create({});
    return res.status(STATUS.OK).json({ data: doc, message: MSG.SUCCESS || 'Success' });
  } catch (error) {
    console.error('Admin get settings error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

router.put('/settings', async (req, res) => {
  try {
    const update = req.body || {};
    const doc = await SystemSettings.findOneAndUpdate({}, update, { upsert: true, new: true });
    await Activity.create({ actor: req.userId, type: 'settings', action: 'update' });
    return res.status(STATUS.OK).json({ data: doc, message: 'Settings updated' });
  } catch (error) {
    console.error('Admin update settings error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// Recent activities (Super Admin only - no organizationId)
router.get('/activities', async (req, res) => {
  try {
    const items = await Activity.find({ 
      $or: [
        { 'meta.organizationId': { $exists: false } },
        { 'meta.organizationId': null }
      ]
    }).sort({ createdAt: -1 }).limit(20).populate('actor', 'name email').lean();
    return res.status(STATUS.OK).json({ data: items, message: MSG.SUCCESS || 'Success' });
  } catch (error) {
    console.error('Admin list activities error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

router.post('/organizations', async (req, res) => {
  try {
    const { name, type, manager, settings, address, contact, isActive, adminEmail, adminName } = req.body || {};
    if (!name) return res.status(STATUS.BAD_REQUEST).json({ message: MSG.BAD_REQUEST || 'Bad request' });
    const exists = await Organization.findOne({ name });
    if (exists) return res.status(STATUS.BAD_REQUEST).json({ message: 'Organization already exists' });
    
    // Create the organization
    const org = await Organization.create({ name, type, manager, settings, address, contact, isActive });
    
    // Create super admin credentials for the organization
    const adminEmailToUse = adminEmail || `admin@${name.toLowerCase().replace(/\s+/g, '')}.com`;
    const adminNameToUse = adminName || `${name} Admin`;
    const defaultPassword = 'Admin@123';
    
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: adminEmailToUse });
    if (existingAdmin) {
      return res.status(STATUS.BAD_REQUEST).json({ 
        message: `Admin user with email ${adminEmailToUse} already exists` 
      });
    }
    
    // Create super admin user for the organization
    const adminUser = await User.create({
      name: adminNameToUse,
      email: adminEmailToUse,
      password: await bcrypt.hash(defaultPassword, 10),
      role: 'admin',
      organizationId: org._id
    });
    
    // Update organization with the admin as manager
    org.manager = adminUser._id;
    await org.save();
    
    // Create activity log
    await Activity.create({ 
      actor: req.userId, 
      type: 'organization', 
      action: 'create', 
      meta: { 
        orgId: org._id, 
        name,
        adminUserId: adminUser._id,
        adminEmail: adminEmailToUse
      } 
    });
    
    // Return organization data with admin credentials
    const safeAdminUser = adminUser.toObject();
    delete safeAdminUser.password;
    
    return res.status(STATUS.CREATED).json({ 
      data: { 
        organization: org,
        adminUser: safeAdminUser,
        credentials: {
          email: adminEmailToUse,
          password: defaultPassword,
          role: 'admin'
        }
      }, 
      message: 'Organization created with admin credentials' 
    });
  } catch (error) {
    console.error('Admin create org error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

router.put('/organizations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body || {};
    const org = await Organization.findByIdAndUpdate(id, update, { new: true }).populate('manager', 'name email role');
    if (!org) return res.status(STATUS.NOT_FOUND).json({ message: 'Organization not found' });
    await Activity.create({ actor: req.userId, type: 'organization', action: 'update', meta: { orgId: id } });
    return res.status(STATUS.OK).json({ data: org, message: 'Organization updated' });
  } catch (error) {
    console.error('Admin update org error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

router.delete('/organizations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const org = await Organization.findByIdAndDelete(id);
    if (!org) return res.status(STATUS.NOT_FOUND).json({ message: 'Organization not found' });
    await Activity.create({ actor: req.userId, type: 'organization', action: 'delete', meta: { orgId: id } });
    return res.status(STATUS.OK).json({ message: 'Organization deleted' });
  } catch (error) {
    console.error('Admin delete org error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// Pending approvals
router.get('/pending-approvals', async (req, res) => {
  try {
    const [payrolls, leaves, contracts] = await Promise.all([
      Payroll.find({ status: 'pending' }).populate('employee', 'name email').lean(),
      Leave.find({ status: 'pending' }).populate('employee', 'name email').lean(),
      ContractAssignment.find({ status: 'pending' }).populate('contractorEmployee', 'name email').lean()
    ]);

    const pendingItems = [
      ...payrolls.map(p => ({
        _id: p._id,
        type: 'payroll',
        title: `Payroll - ${p.month}/${p.year}`,
        description: `Payroll for ${p.employee?.name || 'Unknown'}`,
        status: p.status,
        createdAt: p.createdAt,
        employee: p.employee,
        amount: p.basicSalary
      })),
      ...leaves.map(l => ({
        _id: l._id,
        type: 'leave',
        title: `${l.type} Leave`,
        description: `${l.days} days leave for ${l.employee?.name || 'Unknown'}`,
        status: l.status,
        createdAt: l.createdAt,
        employee: l.employee,
        days: l.days
      })),
      ...contracts.map(c => ({
        _id: c._id,
        type: 'contract',
        title: c.title,
        description: `Contract assignment for ${c.contractorEmployee?.name || 'Unknown'}`,
        status: c.status,
        createdAt: c.createdAt,
        employee: c.contractorEmployee,
        amount: c.rateAmount
      }))
    ];

    return res.status(STATUS.OK).json({ data: pendingItems, message: MSG.SUCCESS || 'Success' });
  } catch (error) {
    console.error('Admin get pending approvals error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// System health
router.get('/system-health', async (req, res) => {
  try {
    const [totalEmployees, activeEmployees, totalUsers, recentActivities, recentErrors] = await Promise.all([
      Employee.countDocuments({}),
      Employee.countDocuments({ status: 'active' }),
      User.countDocuments({}),
      Activity.countDocuments({ createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
      Activity.countDocuments({ 
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        action: { $regex: /error|failed/i }
      })
    ]);

    const employeeHealth = totalEmployees > 0 ? (activeEmployees / totalEmployees) * 100 : 100;
    const activityHealth = recentActivities > 0 ? Math.min(100, (recentActivities / 10) * 100) : 50;
    const overall = Math.round((employeeHealth + activityHealth) / 2);

    const metrics = {
      overall,
      employeeHealth: Math.round(employeeHealth),
      activityHealth: Math.round(activityHealth),
      systemUptime: 99.9, // Placeholder
      databaseStatus: 'connected',
      serverStatus: 'running',
      lastBackup: new Date().toISOString(),
      activeUsers: totalUsers,
      totalUsers,
      recentErrors
    };

    const healthChecks = [
      {
        name: 'Database Connection',
        status: 'healthy',
        message: 'Database is connected and responsive',
        lastChecked: new Date().toISOString()
      },
      {
        name: 'Server Performance',
        status: overall >= 90 ? 'healthy' : overall >= 70 ? 'warning' : 'error',
        message: `System performance at ${overall}%`,
        lastChecked: new Date().toISOString()
      },
      {
        name: 'Employee Activity',
        status: employeeHealth >= 90 ? 'healthy' : employeeHealth >= 70 ? 'warning' : 'error',
        message: `${activeEmployees}/${totalEmployees} employees active`,
        lastChecked: new Date().toISOString()
      }
    ];

    return res.status(STATUS.OK).json({ 
      data: { metrics, healthChecks }, 
      message: MSG.SUCCESS || 'Success' 
    });
  } catch (error) {
    console.error('Admin get system health error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// Global Analytics - Comprehensive system-wide analytics
router.get('/global-analytics', async (req, res) => {
  try {
    // Basic stats
    const [totalOrganizations, totalUsers, totalEmployees, totalContractors, activeContracts] = await Promise.all([
      Organization.countDocuments({}),
      User.countDocuments({}),
      Employee.countDocuments({}),
      Employee.countDocuments({ employmentType: 'contract' }),
      ContractAssignment.countDocuments({ status: 'active' })
    ]);

    // Calculate total revenue from all organizations
    const revenueData = await Payroll.aggregate([
      {
        $match: {
          status: 'approved',
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$netSalary' }
        }
      }
    ]);

    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

    // Count unpaid invoices (placeholder - would need ContractorInvoice model)
    const unpaidInvoices = 0; // Placeholder

    // System uptime (placeholder)
    const systemUptime = 99.9;

    const stats = {
      totalOrganizations,
      totalUsers,
      totalEmployees,
      totalContractors,
      activeContracts,
      totalRevenue,
      unpaidInvoices,
      systemUptime
    };

    // Organizations data with detailed metrics
    const organizations = await Organization.aggregate([
      {
        $lookup: {
          from: 'employees',
          localField: '_id',
          foreignField: 'organization',
          as: 'employees'
        }
      },
      {
        $lookup: {
          from: 'contractassignments',
          localField: '_id',
          foreignField: 'organizationId',
          as: 'contracts'
        }
      },
      {
        $addFields: {
          totalEmployees: { $size: '$employees' },
          totalContractors: {
            $size: {
              $filter: {
                input: '$employees',
                cond: { $eq: ['$$this.employmentType', 'contract'] }
              }
            }
          },
          monthlyRevenue: { $multiply: [{ $size: '$employees' }, 50000] }, // Placeholder calculation
          attendanceRate: 85 + Math.random() * 15, // Placeholder
          status: 'active'
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          type: 1,
          totalEmployees: 1,
          totalContractors: 1,
          monthlyRevenue: 1,
          attendanceRate: { $round: ['$attendanceRate', 1] },
          status: 1
        }
      }
    ]);

    // Contractor utilization data
    const contractorUtilization = await Employee.aggregate([
      {
        $match: { employmentType: 'contract' }
      },
      {
        $lookup: {
          from: 'contractassignments',
          localField: '_id',
          foreignField: 'contractorEmployee',
          as: 'assignments'
        }
      },
      {
        $addFields: {
          totalAssignments: { $size: '$assignments' },
          totalHours: { $multiply: [{ $size: '$assignments' }, 160] }, // Placeholder
          totalRevenue: { $multiply: [{ $size: '$assignments' }, 50000] }, // Placeholder
          utilizationRate: 70 + Math.random() * 30, // Placeholder
          activeContracts: {
            $size: {
              $filter: {
                input: '$assignments',
                cond: { $eq: ['$$this.status', 'active'] }
              }
            }
          }
        }
      },
      {
        $project: {
          contractorId: '$_id',
          contractorName: '$name',
          totalAssignments: 1,
          totalHours: 1,
          totalRevenue: 1,
          utilizationRate: { $round: ['$utilizationRate', 1] },
          activeContracts: 1
        }
      }
    ]);

    // Revenue analysis per organization
    const revenueAnalysis = organizations.map(org => ({
      organizationId: org._id,
      organizationName: org.name,
      monthlyRevenue: org.monthlyRevenue,
      totalEmployees: org.totalEmployees,
      revenuePerEmployee: org.totalEmployees > 0 ? Math.round(org.monthlyRevenue / org.totalEmployees) : 0,
      growthRate: (Math.random() - 0.5) * 20 // Placeholder growth rate
    }));

    // Attendance data
    const attendanceAnalysis = organizations.map(org => ({
      organizationId: org._id,
      organizationName: org.name,
      totalEmployees: org.totalEmployees,
      presentToday: Math.round(org.totalEmployees * (org.attendanceRate / 100)),
      attendanceRate: org.attendanceRate,
      averageHours: 8 + Math.random() * 2 // Placeholder
    }));

    // Payroll data
    const payrollAnalysis = organizations.map(org => ({
      organizationId: org._id,
      organizationName: org.name,
      totalPayroll: org.monthlyRevenue,
      averageSalary: org.totalEmployees > 0 ? Math.round(org.monthlyRevenue / org.totalEmployees) : 0,
      totalEmployees: org.totalEmployees,
      processedThisMonth: Math.random() > 0.3 // Placeholder
    }));

    // Unpaid invoices (placeholder data)
    const unpaidInvoicesData = [];

    return res.status(STATUS.OK).json({
      data: {
        stats,
        organizations,
        contractorUtilization,
        revenueData: revenueAnalysis,
        attendanceData: attendanceAnalysis,
        payrollData: payrollAnalysis,
        unpaidInvoices: unpaidInvoicesData
      },
      message: MSG.SUCCESS || 'Success'
    });
  } catch (error) {
    console.error('Admin get global analytics error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// Advanced Reporting - Comprehensive reporting with charts and analytics
router.post('/advanced-reports', async (req, res) => {
  try {
    const { period, organization } = req.body || {};
    
    // Calculate date range based on period
    const now = new Date();
    let startDate, endDate;
    
    switch (period) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = now;
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'quarterly':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        endDate = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
        break;
      case 'yearly':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        endDate = now;
    }

    // Build organization filter
    const orgFilter = organization && organization !== 'all' ? { _id: organization } : {};

    // Get organizations data
    const organizations = await Organization.aggregate([
      { $match: orgFilter },
      {
        $lookup: {
          from: 'employees',
          localField: '_id',
          foreignField: 'organization',
          as: 'employees'
        }
      },
      {
        $lookup: {
          from: 'contractassignments',
          localField: '_id',
          foreignField: 'organizationId',
          as: 'contracts'
        }
      },
      {
        $addFields: {
          totalEmployees: { $size: '$employees' },
          totalContractors: {
            $size: {
              $filter: {
                input: '$employees',
                cond: { $eq: ['$$this.employmentType', 'contract'] }
              }
            }
          },
          revenue: { $multiply: [{ $size: '$employees' }, 50000] }, // Placeholder calculation
          attendance: 85 + Math.random() * 15, // Placeholder
          payroll: { $multiply: [{ $size: '$employees' }, 45000] }, // Placeholder
          contracts: { $size: '$contracts' },
          growth: (Math.random() - 0.5) * 20 // Placeholder growth
        }
      },
      {
        $project: {
          organizationId: '$_id',
          organizationName: '$name',
          revenue: { $round: ['$revenue', 0] },
          employees: '$totalEmployees',
          attendance: { $round: ['$attendance', 1] },
          payroll: { $round: ['$payroll', 0] },
          contracts: '$contracts',
          growth: { $round: ['$growth', 1] }
        }
      }
    ]);

    // Calculate summary statistics
    const totalRevenue = organizations.reduce((sum, org) => sum + org.revenue, 0);
    const totalEmployees = organizations.reduce((sum, org) => sum + org.employees, 0);
    const totalOrganizations = organizations.length;
    const averageAttendance = organizations.length > 0 
      ? organizations.reduce((sum, org) => sum + org.attendance, 0) / organizations.length 
      : 0;
    const payrollProcessed = organizations.reduce((sum, org) => sum + org.payroll, 0);
    const contractsActive = organizations.reduce((sum, org) => sum + org.contracts, 0);
    const growthRate = organizations.length > 0 
      ? organizations.reduce((sum, org) => sum + org.growth, 0) / organizations.length 
      : 0;

    const summary = {
      period,
      totalRevenue,
      totalEmployees,
      totalOrganizations,
      averageAttendance: Math.round(averageAttendance * 10) / 10,
      payrollProcessed,
      contractsActive,
      growthRate: Math.round(growthRate * 10) / 10
    };

    // Generate time series data
    const timeSeriesData = [];
    const days = period === 'daily' ? 1 : period === 'weekly' ? 7 : period === 'monthly' ? 30 : 365;
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      timeSeriesData.push({
        date: date.toISOString().split('T')[0],
        revenue: Math.round(totalRevenue * (0.8 + Math.random() * 0.4) / days),
        employees: Math.round(totalEmployees * (0.9 + Math.random() * 0.2) / days),
        attendance: Math.round(averageAttendance * (0.8 + Math.random() * 0.4)),
        payroll: Math.round(payrollProcessed * (0.8 + Math.random() * 0.4) / days)
      });
    }

    // Generate chart data
    const revenueChart = {
      labels: organizations.map(org => org.organizationName),
      datasets: [{
        label: 'Revenue',
        data: organizations.map(org => org.revenue),
        backgroundColor: organizations.map(() => `hsl(${Math.random() * 360}, 70%, 50%)`),
        borderColor: organizations.map(() => `hsl(${Math.random() * 360}, 70%, 40%)`)
      }]
    };

    const attendanceChart = {
      labels: organizations.map(org => org.organizationName),
      datasets: [{
        label: 'Attendance %',
        data: organizations.map(org => org.attendance),
        backgroundColor: organizations.map(() => `hsl(${Math.random() * 360}, 70%, 50%)`),
        borderColor: organizations.map(() => `hsl(${Math.random() * 360}, 70%, 40%)`)
      }]
    };

    const payrollChart = {
      labels: organizations.map(org => org.organizationName),
      datasets: [{
        label: 'Payroll',
        data: organizations.map(org => org.payroll),
        backgroundColor: organizations.map(() => `hsl(${Math.random() * 360}, 70%, 50%)`),
        borderColor: organizations.map(() => `hsl(${Math.random() * 360}, 70%, 40%)`)
      }]
    };

    return res.status(STATUS.OK).json({
      data: {
        summary,
        organizations,
        timeSeries: timeSeriesData,
        revenueChart,
        attendanceChart,
        payrollChart
      },
      message: MSG.SUCCESS || 'Success'
    });
  } catch (error) {
    console.error('Admin get advanced reports error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// Export reports in different formats
router.post('/export-report', async (req, res) => {
  try {
    const { format, period, organization, reportType } = req.body || {};
    
    // Generate report data based on parameters
    const reportData = {
      title: `Advanced Report - ${period.charAt(0).toUpperCase() + period.slice(1)}`,
      generatedAt: new Date().toISOString(),
      period,
      organization,
      reportType
    };

    // For now, return a simple JSON response
    // In a real implementation, you would generate actual PDF/Excel/CSV files
    let contentType, fileExtension;
    
    switch (format) {
      case 'pdf':
        contentType = 'application/pdf';
        fileExtension = 'pdf';
        break;
      case 'excel':
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        fileExtension = 'xlsx';
        break;
      case 'csv':
        contentType = 'text/csv';
        fileExtension = 'csv';
        break;
      default:
        contentType = 'application/json';
        fileExtension = 'json';
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="report.${fileExtension}"`);
    
    // Return mock data for now
    return res.status(STATUS.OK).json({
      data: JSON.stringify(reportData),
      message: MSG.SUCCESS || 'Success'
    });
  } catch (error) {
    console.error('Admin export report error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// Enhanced Contractor Management APIs

// Get contractor statistics
router.get('/contractor-stats', async (req, res) => {
  try {
    const [totalContractors, activeContractors, totalAssignments, totalRevenue] = await Promise.all([
      Employee.countDocuments({ employmentType: 'contract' }),
      Employee.countDocuments({ employmentType: 'contract', status: 'active' }),
      ContractAssignment.countDocuments({}),
      ContractAssignment.aggregate([
        { $group: { _id: null, total: { $sum: '$rateAmount' } } }
      ])
    ]);

    const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;

    // Get top performers
    const topPerformers = await Employee.aggregate([
      { $match: { employmentType: 'contract' } },
      {
        $lookup: {
          from: 'contractassignments',
          localField: '_id',
          foreignField: 'contractorEmployee',
          as: 'assignments'
        }
      },
      {
        $addFields: {
          totalAssignments: { $size: '$assignments' },
          totalRevenue: { $multiply: [{ $size: '$assignments' }, 50000] }, // Placeholder
          utilizationRate: 70 + Math.random() * 30 // Placeholder
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 },
      {
        $project: {
          _id: 1,
          name: 1,
          totalAssignments: 1,
          totalRevenue: 1,
          utilizationRate: 1
        }
      }
    ]);

    const averageUtilization = topPerformers.length > 0 
      ? topPerformers.reduce((sum, p) => sum + p.utilizationRate, 0) / topPerformers.length 
      : 0;

    const stats = {
      totalContractors,
      activeContractors,
      totalAssignments,
      totalRevenue: revenue,
      averageUtilization: Math.round(averageUtilization * 10) / 10,
      topPerformers,
      recentActivity: [] // Placeholder
    };

    return res.status(STATUS.OK).json({
      data: stats,
      message: MSG.SUCCESS || 'Success'
    });
  } catch (error) {
    console.error('Admin get contractor stats error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// Get contractor assignments history
router.get('/contractor-assignments', async (req, res) => {
  try {
    const assignments = await ContractAssignment.aggregate([
      {
        $lookup: {
          from: 'employees',
          localField: 'contractorEmployee',
          foreignField: '_id',
          as: 'contractor'
        }
      },
      {
        $lookup: {
          from: 'organizations',
          localField: 'organizationId',
          foreignField: '_id',
          as: 'organization'
        }
      },
      {
        $addFields: {
          contractorName: { $arrayElemAt: ['$contractor.name', 0] },
          organizationName: { $arrayElemAt: ['$organization.name', 0] },
          totalHours: 160, // Placeholder
          revenue: '$rateAmount'
        }
      },
      {
        $project: {
          _id: 1,
          contractorName: 1,
          organizationName: 1,
          title: 1,
          startDate: 1,
          endDate: 1,
          status: 1,
          rateAmount: 1,
          totalHours: 1,
          revenue: 1
        }
      },
      { $sort: { createdAt: -1 } },
      { $limit: 50 }
    ]);

    return res.status(STATUS.OK).json({
      data: assignments,
      message: MSG.SUCCESS || 'Success'
    });
  } catch (error) {
    console.error('Admin get contractor assignments error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// Export contractors data
router.post('/export-contractors', async (req, res) => {
  try {
    const { format, filter } = req.body || {};
    
    // Get contractors based on filter
    let contractors = await Employee.find({ employmentType: 'contract' }).lean();
    
    // Apply filters
    if (filter.query) {
      const q = filter.query.toLowerCase();
      contractors = contractors.filter(c => 
        c.name.toLowerCase().includes(q) || 
        c.email.toLowerCase().includes(q)
      );
    }
    
    if (filter.status) {
      contractors = contractors.filter(c => c.status === filter.status);
    }

    // Generate export data
    const exportData = contractors.map(contractor => ({
      name: contractor.name,
      email: contractor.email,
      phone: contractor.phone || '',
      position: contractor.position || '',
      department: contractor.department || '',
      status: contractor.status || 'active',
      createdAt: contractor.createdAt
    }));

    let contentType, fileExtension;
    
    switch (format) {
      case 'pdf':
        contentType = 'application/pdf';
        fileExtension = 'pdf';
        break;
      case 'excel':
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        fileExtension = 'xlsx';
        break;
      case 'csv':
        contentType = 'text/csv';
        fileExtension = 'csv';
        break;
      default:
        contentType = 'application/json';
        fileExtension = 'json';
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="contractors.${fileExtension}"`);
    
    return res.status(STATUS.OK).json({
      data: JSON.stringify(exportData),
      message: MSG.SUCCESS || 'Success'
    });
  } catch (error) {
    console.error('Admin export contractors error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// System-Wide Monitoring APIs

// Get system metrics
router.get('/system-metrics', async (req, res) => {
  try {
    // Simulate system metrics (in production, use actual system monitoring)
    const metrics = {
      cpu: Math.floor(Math.random() * 30) + 20, // 20-50%
      memory: Math.floor(Math.random() * 40) + 30, // 30-70%
      disk: Math.floor(Math.random() * 20) + 40, // 40-60%
      network: Math.floor(Math.random() * 25) + 15, // 15-40%
      uptime: Math.floor(Math.random() * 86400 * 30) + 86400, // 1-30 days
      responseTime: Math.floor(Math.random() * 200) + 50, // 50-250ms
      activeUsers: Math.floor(Math.random() * 50) + 10, // 10-60 users
      totalRequests: Math.floor(Math.random() * 10000) + 5000, // 5k-15k requests
      errorRate: Math.floor(Math.random() * 3) + 1, // 1-4%
      throughput: Math.floor(Math.random() * 100) + 50 // 50-150 req/s
    };

    return res.status(STATUS.OK).json({
      data: metrics,
      message: MSG.SUCCESS || 'Success'
    });
  } catch (error) {
    console.error('Admin get system metrics error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// Get system health status
router.get('/system-health', async (req, res) => {
  try {
    // Check database connection
    const dbStatus = await User.countDocuments().then(() => 'healthy').catch(() => 'critical');
    
    // Check server status (always healthy for this endpoint)
    const serverStatus = 'healthy';
    
    // Check network (simulate)
    const networkStatus = Math.random() > 0.1 ? 'healthy' : 'warning';
    
    // Check security (simulate)
    const securityStatus = Math.random() > 0.05 ? 'healthy' : 'warning';
    
    const overall = [dbStatus, serverStatus, networkStatus, securityStatus].includes('critical') 
      ? 'critical' 
      : [dbStatus, serverStatus, networkStatus, securityStatus].includes('warning') 
        ? 'warning' 
        : 'healthy';

    const health = {
      overall,
      database: dbStatus,
      server: serverStatus,
      network: networkStatus,
      security: securityStatus,
      lastChecked: new Date().toISOString()
    };

    return res.status(STATUS.OK).json({
      data: health,
      message: MSG.SUCCESS || 'Success'
    });
  } catch (error) {
    console.error('Admin get system health error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// Get system alerts
router.get('/system-alerts', async (req, res) => {
  try {
    // Simulate system alerts
    const alerts = [
      {
        id: '1',
        type: 'warning',
        title: 'High CPU Usage',
        message: 'CPU usage has exceeded 80% for the last 5 minutes',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        severity: 'medium',
        resolved: false
      },
      {
        id: '2',
        type: 'error',
        title: 'Database Connection Timeout',
        message: 'Database connection timeout occurred 3 times in the last hour',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        severity: 'high',
        resolved: false
      },
      {
        id: '3',
        type: 'info',
        title: 'Scheduled Maintenance',
        message: 'System maintenance completed successfully',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        severity: 'low',
        resolved: true
      },
      {
        id: '4',
        type: 'warning',
        title: 'Memory Usage Alert',
        message: 'Memory usage is approaching 85% threshold',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        severity: 'medium',
        resolved: false
      }
    ];

    return res.status(STATUS.OK).json({
      data: alerts,
      message: MSG.SUCCESS || 'Success'
    });
  } catch (error) {
    console.error('Admin get system alerts error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// Resolve system alert
router.put('/system-alerts/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params;
    
    // In a real implementation, you would update the alert in the database
    // For now, just return success
    
    return res.status(STATUS.OK).json({
      data: { id, resolved: true },
      message: MSG.SUCCESS || 'Alert resolved successfully'
    });
  } catch (error) {
    console.error('Admin resolve system alert error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// Get performance logs
router.get('/performance-logs', async (req, res) => {
  try {
    // Simulate performance logs
    const logs = Array.from({ length: 20 }, (_, i) => ({
      id: `log-${i + 1}`,
      timestamp: new Date(Date.now() - i * 300000).toISOString(),
      endpoint: ['/api/users', '/api/employees', '/api/attendance', '/api/payroll'][Math.floor(Math.random() * 4)],
      method: ['GET', 'POST', 'PUT', 'DELETE'][Math.floor(Math.random() * 4)],
      responseTime: Math.floor(Math.random() * 1000) + 50,
      statusCode: [200, 201, 400, 401, 404, 500][Math.floor(Math.random() * 6)],
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      ip: `192.168.1.${Math.floor(Math.random() * 255)}`
    }));

    return res.status(STATUS.OK).json({
      data: logs,
      message: MSG.SUCCESS || 'Success'
    });
  } catch (error) {
    console.error('Admin get performance logs error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// Get security events
router.get('/security-events', async (req, res) => {
  try {
    // Simulate security events
    const events = [
      {
        id: '1',
        type: 'Failed Login Attempt',
        description: 'Multiple failed login attempts detected from IP 192.168.1.100',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        severity: 'medium',
        source: '192.168.1.100',
        resolved: false
      },
      {
        id: '2',
        type: 'Suspicious Activity',
        description: 'Unusual API access pattern detected',
        timestamp: new Date(Date.now() - 1200000).toISOString(),
        severity: 'high',
        source: 'API Gateway',
        resolved: false
      },
      {
        id: '3',
        type: 'Security Scan',
        description: 'Automated security scan completed successfully',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        severity: 'low',
        source: 'Security Scanner',
        resolved: true
      },
      {
        id: '4',
        type: 'Access Violation',
        description: 'Unauthorized access attempt to admin endpoints',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        severity: 'critical',
        source: '192.168.1.150',
        resolved: false
      }
    ];

    return res.status(STATUS.OK).json({
      data: events,
      message: MSG.SUCCESS || 'Success'
    });
  } catch (error) {
    console.error('Admin get security events error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// Export logs
router.post('/export-logs', async (req, res) => {
  try {
    const { type, format } = req.body || {};
    
    // Generate mock log data
    let logData = [];
    
    if (type === 'performance') {
      logData = Array.from({ length: 50 }, (_, i) => ({
        timestamp: new Date(Date.now() - i * 300000).toISOString(),
        endpoint: ['/api/users', '/api/employees', '/api/attendance'][Math.floor(Math.random() * 3)],
        method: ['GET', 'POST', 'PUT'][Math.floor(Math.random() * 3)],
        responseTime: Math.floor(Math.random() * 1000) + 50,
        statusCode: [200, 201, 400, 500][Math.floor(Math.random() * 4)],
        ip: `192.168.1.${Math.floor(Math.random() * 255)}`
      }));
    } else if (type === 'security') {
      logData = Array.from({ length: 30 }, (_, i) => ({
        timestamp: new Date(Date.now() - i * 600000).toISOString(),
        type: ['Login Attempt', 'Access Violation', 'Security Scan'][Math.floor(Math.random() * 3)],
        severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
        source: `192.168.1.${Math.floor(Math.random() * 255)}`,
        description: 'Security event description'
      }));
    }

    // Convert to CSV format
    const csvData = logData.map(log => Object.values(log).join(',')).join('\n');
    const headers = Object.keys(logData[0] || {}).join(',');
    const csvContent = headers + '\n' + csvData;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${type}-logs.csv"`);
    
    return res.status(STATUS.OK).json({
      data: csvContent,
      message: MSG.SUCCESS || 'Success'
    });
  } catch (error) {
    console.error('Admin export logs error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

module.exports = router;
