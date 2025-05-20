const Payroll = require('../models/Payroll');
const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

class PayrollService {
    /**
     * Calculate days worked for an employee in a given month
     * @param {string} employeeId - Employee ID
     * @param {number} month - Month (1-12)
     * @param {number} year - Year
     * @returns {Promise<number>} - Number of days worked
     */
    static async calculateDaysWorked(employeeId, month, year) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        const attendance = await Attendance.find({
            employee: employeeId,
            date: {
                $gte: startDate,
                $lte: endDate
            },
            status: 'present'
        });

        return attendance.length;
    }

    /**
     * Generate payroll entries for all employees in a shop for a given month
     * @param {string} shopId - Shop ID
     * @param {number} month - Month (1-12)
     * @param {number} year - Year
     * @returns {Promise<Array>} - Array of created payroll entries
     */
    static async generateMonthlyPayroll(shopId, month, year) {
        try {
            const employees = await Employee.find({ shop: shopId });
            const payrollEntries = [];

            for (const employee of employees) {
                const daysWorked = await this.calculateDaysWorked(employee._id, month, year);
                
                const payrollEntry = new Payroll({
                    employee: employee._id,
                    shop: shopId,
                    month,
                    year,
                    daysWorked,
                    dailySalary: employee.dailySalary,
                    totalAmount: daysWorked * employee.dailySalary,
                    status: 'pending',
                    allowances: [],
                    deductions: []
                });

                await payrollEntry.save();
                payrollEntries.push(payrollEntry);
            }

            return payrollEntries;
        } catch (error) {
            console.error('Error generating monthly payroll:', error);
            throw error;
        }
    }

    /**
     * Get payroll summary for a shop
     * @param {string} shopId - Shop ID
     * @param {number} month - Month (1-12)
     * @param {number} year - Year
     * @returns {Promise<Object>} - Payroll summary
     */
    static async getShopPayrollSummary(shopId, month, year) {
        const payrolls = await Payroll.find({
            shop: shopId,
            month,
            year
        }).populate('employee', 'name');

        const summary = {
            totalEmployees: payrolls.length,
            totalAmount: payrolls.reduce((sum, payroll) => sum + payroll.totalAmount, 0),
            pendingApprovals: payrolls.filter(p => p.status === 'pending').length,
            approved: payrolls.filter(p => p.status === 'approved').length,
            paid: payrolls.filter(p => p.status === 'paid').length,
            entries: payrolls
        };

        return summary;
    }

    /**
     * Approve payroll entry
     * @param {string} payrollId - Payroll entry ID
     * @param {string} approverId - User ID of approver
     * @returns {Promise<Object>} - Updated payroll entry
     */
    static async approvePayroll(payrollId, approverId) {
        const payroll = await Payroll.findById(payrollId);
        
        if (!payroll) {
            throw new Error('Payroll entry not found');
        }

        payroll.isApproved = true;
        payroll.approvedBy = approverId;
        payroll.approvedAt = new Date();
        payroll.status = 'approved';

        await payroll.save();
        return payroll;
    }
}

module.exports = PayrollService; 