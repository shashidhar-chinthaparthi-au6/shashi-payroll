const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Payslip = require('../models/Payslip');
const Employee = require('../models/Employee');
const Payroll = require('../models/Payroll');
const Attendance = require('../models/Attendance');
const User = require('../models/User');

describe('Payslip API Tests', () => {
  let authToken;
  let testEmployee;
  let testPayroll;
  let testPayslip;

  beforeAll(async () => {
    // Create test user and get auth token
    const user = await User.create({
      email: 'test@example.com',
      password: 'password123',
      role: 'admin'
    });

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    authToken = loginResponse.body.token;

    // Create test employee
    testEmployee = await Employee.create({
      name: 'Test Employee',
      email: 'employee@test.com',
      employeeId: 'EMP001',
      department: 'IT'
    });

    // Create test payroll
    testPayroll = await Payroll.create({
      employee: testEmployee._id,
      basicSalary: 5000,
      allowances: [
        { name: 'HRA', amount: 2000 },
        { name: 'Transport', amount: 1000 }
      ],
      deductions: [
        { name: 'Tax', amount: 500 },
        { name: 'PF', amount: 600 }
      ],
      netSalary: 6900
    });

    // Create test attendance
    await Attendance.create({
      employee: testEmployee._id,
      date: new Date(),
      status: 'present'
    });
  });

  afterAll(async () => {
    // Clean up test data
    await User.deleteMany({});
    await Employee.deleteMany({});
    await Payroll.deleteMany({});
    await Attendance.deleteMany({});
    await Payslip.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /api/payslips/generate', () => {
    it('should generate a new payslip', async () => {
      const response = await request(app)
        .post('/api/payslips/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          employeeId: testEmployee._id,
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear()
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.employee).toBe(testEmployee._id.toString());
      expect(response.body.basicSalary).toBe(5000);
      expect(response.body.netSalary).toBe(6900);
      expect(response.body.status).toBe('pending');

      testPayslip = response.body;
    });

    it('should not generate duplicate payslip', async () => {
      const response = await request(app)
        .post('/api/payslips/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          employeeId: testEmployee._id,
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear()
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/payslips/employee/:employeeId', () => {
    it('should get payslip history for an employee', async () => {
      const response = await request(app)
        .get(`/api/payslips/employee/${testEmployee._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].employee).toBe(testEmployee._id.toString());
    });
  });

  describe('GET /api/payslips/:payslipId', () => {
    it('should get specific payslip details', async () => {
      const response = await request(app)
        .get(`/api/payslips/${testPayslip._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body._id).toBe(testPayslip._id.toString());
      expect(response.body.employee).toBe(testEmployee._id.toString());
    });

    it('should return 404 for non-existent payslip', async () => {
      const response = await request(app)
        .get(`/api/payslips/${new mongoose.Types.ObjectId()}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/payslips/:payslipId/approve', () => {
    it('should approve payslip and send email', async () => {
      const response = await request(app)
        .post(`/api/payslips/${testPayslip._id}/approve`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('approved');
      expect(response.body.approvedAt).toBeDefined();
      expect(response.body.approvedBy).toBeDefined();
    });
  });

  describe('GET /api/payslips/:payslipId/download', () => {
    it('should download payslip PDF', async () => {
      const response = await request(app)
        .get(`/api/payslips/${testPayslip._id}/download`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('application/pdf');
    });
  });
}); 