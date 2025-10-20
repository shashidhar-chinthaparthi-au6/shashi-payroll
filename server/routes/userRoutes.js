const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Employee = require('../models/Employee');
const { verifyToken, checkRole } = require('../middleware/auth');
const STATUS = require('../utils/constants/statusCodes');
const MSG = require('../utils/constants/messages');

// Get current user's profile (includes employee profile if exists)
router.get('/me', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password').lean();
        if (!user) {
            return res.status(STATUS.NOT_FOUND).json({ message: MSG.USER_NOT_FOUND });
        }

        let employee = null;
        if (user.role === 'employee') {
            employee = await Employee.findOne({ userId: req.userId })
                .select('-__v')
                .lean();
        }

        res.status(STATUS.OK).json({ user, employee });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
    }
});

// Update current user's basic profile (limited fields)
router.patch('/me', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(STATUS.NOT_FOUND).json({ message: MSG.USER_NOT_FOUND });
        }

        // Allow only limited fields to be edited
        const editableFields = ['name'];
        editableFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                user[field] = req.body[field];
            }
        });

        await user.save();
        const sanitized = user.toObject();
        delete sanitized.password;
        res.status(STATUS.OK).json({ user: sanitized, message: MSG.USER_UPDATED });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
    }
});

// Get current employee profile (employee only)
router.get('/me/employee', verifyToken, checkRole(['employee']), async (req, res) => {
    try {
        const employee = await Employee.findOne({ userId: req.userId }).lean();
        if (!employee) {
            return res.status(STATUS.NOT_FOUND).json({ message: MSG.EMPLOYEE_NOT_FOUND });
        }
        res.status(STATUS.OK).json({ employee });
    } catch (error) {
        console.error('Error fetching employee profile:', error);
        res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
    }
});

// Update employee profile (employee only, limited fields)
router.patch('/me/employee', verifyToken, checkRole(['employee']), async (req, res) => {
    try {
        const employee = await Employee.findOne({ userId: req.userId });
        if (!employee) {
            return res.status(STATUS.NOT_FOUND).json({ message: MSG.EMPLOYEE_NOT_FOUND });
        }

        // Editable fields for employee profile
        const editableFields = [
            'phone',
            'address',
            'department',
            'position',
            'emergencyContact',
            'bankDetails'
        ];

        editableFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                employee[field] = req.body[field];
            }
        });

        await employee.save();
        res.status(STATUS.OK).json({ employee, message: MSG.EMPLOYEE_UPDATED });
    } catch (error) {
        console.error('Error updating employee profile:', error);
        res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
    }
});

// Change password route
router.post('/change-password', verifyToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.userId);

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(STATUS.BAD_REQUEST).json({ message: 'Current password is incorrect' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        user.password = hashedPassword;
        await user.save();

        res.status(STATUS.OK).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
    }
});

// Get all users (for development purposes)
router.get('/all', verifyToken, async (req, res) => {
    try {
        const users = await User.find({}, { password: 0 }) // Exclude password from response
            .sort({ createdAt: -1 })
            .lean();

        // For each user, get their employee data if they are an employee
        const usersWithEmployeeData = await Promise.all(
            users.map(async (user) => {
                let employeeData = null;
                if (user.role === 'employee') {
                    const employee = await Employee.findOne({ userId: user._id }).lean();
                    if (employee) {
                        employeeData = {
                            id: employee._id,
                            firstName: employee.firstName,
                            lastName: employee.lastName,
                            department: employee.department,
                            position: employee.position,
                            shop: employee.shop
                        };
                    }
                }
                return {
                    ...user,
                    employee: employeeData
                };
            })
        );

        res.json({
            success: true,
            data: usersWithEmployeeData
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching users',
            error: error.message 
        });
    }
});

// Delete user (for development purposes)
router.delete('/:userId', verifyToken, async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Find the user first
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        // If user is an employee, also delete their employee record
        if (user.role === 'employee') {
            await Employee.findOneAndDelete({ userId: userId });
        }

        // Delete the user
        await User.findByIdAndDelete(userId);

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error deleting user',
            error: error.message 
        });
    }
});

module.exports = router; 