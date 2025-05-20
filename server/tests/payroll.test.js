const mongoose = require('mongoose');
const PayrollService = require('../utils/payrollService');
const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Shop = require('../models/Shop');
const User = require('../models/User');

jest.setTimeout(20000);

describe('Payroll Service', () => {
    let testShop;
    let testEmployee;
    let testAttendance;
    let testUser;

    beforeAll(async () => {
        // Create test user
        testUser = await User.create({
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123',
            role: 'client'
        });

        // Create test shop
        testShop = await Shop.create({
            name: 'Test Shop',
            owner: testUser._id,
            email: 'shop@example.com',
            address: {
                street: '123 Test St',
                city: 'Test City',
                state: 'TS',
                zipCode: '12345'
            },
            phone: '1234567890'
        });

        // Create test employee
        testEmployee = await Employee.create({
            firstName: 'Test',
            lastName: 'Employee',
            position: 'Developer',
            shop: testShop._id,
            dailySalary: 1000,
            phone: '9876543210',
            email: 'employee@test.com'
        });

        // Create test attendance
        const today = new Date();
        testAttendance = await Attendance.create({
            employee: testEmployee._id,
            date: today,
            status: 'present',
            shop: testShop._id
        });
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    });

    describe('calculateDaysWorked', () => {
        it('should calculate days worked correctly', async () => {
            const daysWorked = await PayrollService.calculateDaysWorked(
                testEmployee._id,
                new Date().getMonth() + 1,
                new Date().getFullYear()
            );
            expect(daysWorked).toBeGreaterThanOrEqual(1);
        });
    });

    describe('generateMonthlyPayroll', () => {
        it('should generate payroll entries for all employees', async () => {
            const payrollEntries = await PayrollService.generateMonthlyPayroll(
                testShop._id,
                new Date().getMonth() + 1,
                new Date().getFullYear()
            );

            expect(payrollEntries).toHaveLength(1);
            expect(payrollEntries[0].employee.toString()).toBe(testEmployee._id.toString());
            expect(payrollEntries[0].shop.toString()).toBe(testShop._id.toString());
            expect(payrollEntries[0].status).toBe('pending');
        });
    });

    describe('getShopPayrollSummary', () => {
        it('should return correct payroll summary', async () => {
            const summary = await PayrollService.getShopPayrollSummary(
                testShop._id,
                new Date().getMonth() + 1,
                new Date().getFullYear()
            );

            expect(summary.totalEmployees).toBeGreaterThanOrEqual(1);
            expect(summary.totalAmount).toBeGreaterThan(0);
            expect(summary.pendingApprovals).toBeGreaterThanOrEqual(1);
        });
    });

    describe('approvePayroll', () => {
        it('should approve payroll entry correctly', async () => {
            // First generate a payroll entry
            const payrollEntries = await PayrollService.generateMonthlyPayroll(
                testShop._id,
                new Date().getMonth() + 1,
                new Date().getFullYear()
            );

            const approvedPayroll = await PayrollService.approvePayroll(
                payrollEntries[0]._id,
                testUser._id
            );

            expect(approvedPayroll.isApproved).toBe(true);
            expect(approvedPayroll.status).toBe('approved');
            expect(approvedPayroll.approvedAt).toBeDefined();
        });
    });
}); 