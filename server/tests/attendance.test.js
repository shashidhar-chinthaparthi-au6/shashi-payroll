const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Employee = require('../models/Employee');
const Shop = require('../models/Shop');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

let testToken;
let testEmployee;
let testShop;
let testAdminToken;
let testAdmin;
let testClient;
let testEmployeeUser;

beforeAll(async () => {
  // Create test client (shop owner)
  testClient = await User.create({
    name: 'Test Client',
    email: 'client@test.com',
    password: 'password123',
    role: 'client'
  });

  // Create test shop
  testShop = await Shop.create({
    name: 'Test Shop',
    address: {
      street: '123 Test St',
      city: 'Test City',
      state: 'Test State',
      zipCode: '12345'
    },
    phone: '1234567890',
    email: 'shop@test.com',
    owner: testClient._id
  });

  // Create test employee user
  testEmployeeUser = await User.create({
    name: 'Test Employee User',
    email: 'employee@test.com',
    password: 'password123',
    role: 'employee'
  });

  // Create test employee
  testEmployee = await Employee.create({
    firstName: 'Test',
    lastName: 'Employee',
    email: 'test@example.com',
    phone: '1234567890',
    position: 'Developer',
    shop: testShop._id,
    user: testEmployeeUser._id
  });

  // Create test admin user
  testAdmin = await User.create({
    name: 'Test Admin',
    email: 'admin@test.com',
    password: 'password123',
    role: 'admin'
  });

  // Generate tokens
  testToken = jwt.sign(
    { id: testEmployeeUser._id, role: 'employee' },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );

  testAdminToken = jwt.sign(
    { id: testAdmin._id, role: 'admin' },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('Attendance System', () => {
  beforeEach(async () => {
    await Attendance.deleteMany({});
  });

  describe('POST /api/attendance/check-in', () => {
    it('should create a manual check-in record', async () => {
      const res = await request(app)
        .post('/api/attendance/check-in')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          employeeId: testEmployee._id,
          shopId: testShop._id
        });

      expect(res.status).toBe(201);
      expect(res.body.employee).toBe(testEmployee._id.toString());
      expect(res.body.shop).toBe(testShop._id.toString());
      expect(res.body.checkIn.method).toBe('manual');
    });

    it('should prevent duplicate check-ins', async () => {
      // First check-in
      await request(app)
        .post('/api/attendance/check-in')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          employeeId: testEmployee._id,
          shopId: testShop._id
        });

      // Second check-in attempt
      const res = await request(app)
        .post('/api/attendance/check-in')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          employeeId: testEmployee._id,
          shopId: testShop._id
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Already checked in today');
    });
  });

  describe('POST /api/attendance/qr-check-in', () => {
    it('should create a QR check-in record', async () => {
      const res = await request(app)
        .post('/api/attendance/qr-check-in')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          employeeId: testEmployee._id,
          shopId: testShop._id
        });

      expect(res.status).toBe(201);
      expect(res.body.checkIn.method).toBe('qr');
    });
  });

  describe('POST /api/attendance/check-out', () => {
    it('should record check-out time', async () => {
      // First create a check-in
      const checkInRes = await request(app)
        .post('/api/attendance/check-in')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          employeeId: testEmployee._id,
          shopId: testShop._id
        });

      expect(checkInRes.status).toBe(201);
      console.log('Check-in response:', checkInRes.body);

      // Get today's date range using UTC
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

      // Log all attendance records for debugging
      const allAttendance = await Attendance.find({});
      console.log('All attendance records after check-in:', allAttendance);

      // Verify the check-in was created without a check-out
      const attendance = await Attendance.findOne({
        employee: testEmployee._id,
        date: {
          $gte: today,
          $lt: tomorrow
        }
      });
      console.log('Found attendance before check-out:', attendance);
      expect(attendance).toBeTruthy();
      console.log('attendance.checkOut:', attendance.checkOut);
      expect(attendance.checkOut === undefined || attendance.checkOut === null).toBe(true);

      // Then check-out
      const res = await request(app)
        .post('/api/attendance/check-out')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          employeeId: testEmployee._id.toString(),
          method: 'manual'
        });

      console.log('Check-out response:', res.body);
      expect(res.status).toBe(200);
      expect(res.body.checkOut).toBeDefined();
      expect(res.body.checkOut.method).toBe('manual');
    });

    it('should prevent check-out without check-in', async () => {
      const res = await request(app)
        .post('/api/attendance/check-out')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          employeeId: testEmployee._id.toString()
        });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('No check-in found for today');
    });
  });

  describe('GET /api/attendance/employee/:employeeId', () => {
    it('should get attendance records for an employee', async () => {
      // Create some attendance records
      await Attendance.create({
        employee: testEmployee._id,
        shop: testShop._id,
        date: new Date(),
        checkIn: {
          time: new Date(),
          method: 'manual'
        }
      });

      const res = await request(app)
        .get(`/api/attendance/employee/${testEmployee._id}`)
        .set('Authorization', `Bearer ${testToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/attendance/shop/:shopId', () => {
    it('should get attendance records for a shop (admin only)', async () => {
      // Create some attendance records
      await Attendance.create({
        employee: testEmployee._id,
        shop: testShop._id,
        date: new Date(),
        checkIn: {
          time: new Date(),
          method: 'manual'
        }
      });

      const res = await request(app)
        .get(`/api/attendance/shop/${testShop._id}`)
        .set('Authorization', `Bearer ${testAdminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should deny access to non-admin users', async () => {
      // Create some attendance records first
      await Attendance.create({
        employee: testEmployee._id,
        shop: testShop._id,
        date: new Date(),
        checkIn: {
          time: new Date(),
          method: 'manual'
        }
      });

      const res = await request(app)
        .get(`/api/attendance/shop/${testShop._id}`)
        .set('Authorization', `Bearer ${testToken}`);

      expect(res.status).toBe(403);
    });
  });
}); 