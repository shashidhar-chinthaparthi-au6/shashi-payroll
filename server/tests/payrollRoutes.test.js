const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Shop = require('../models/Shop');
const Employee = require('../models/Employee');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

jest.setTimeout(20000);

describe('Payroll Routes', () => {
    let testShop;
    let testEmployee;
    let testUser;
    let authToken;

    beforeAll(async () => {
        // Create test user and generate token
        testUser = await User.create({
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123',
            role: 'admin'
        });

        authToken = jwt.sign(
            { id: testUser._id },
            config[process.env.NODE_ENV || 'development'].jwt.secret,
            { expiresIn: '1h' }
        );

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
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    });

    describe('POST /api/payroll/generate/:shopId', () => {
        it('should generate payroll entries', async () => {
            const response = await request(app)
                .post(`/api/payroll/generate/${testShop._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    month: new Date().getMonth() + 1,
                    year: new Date().getFullYear()
                });

            expect(response.status).toBe(201);
            expect(response.body).toBeInstanceOf(Array);
            expect(response.body[0].employee).toBeDefined();
            expect(response.body[0].shop).toBeDefined();
        });

        it('should require month and year', async () => {
            const response = await request(app)
                .post(`/api/payroll/generate/${testShop._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({});

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });
    });

    describe('GET /api/payroll/summary/:shopId', () => {
        it('should return payroll summary', async () => {
            const response = await request(app)
                .get(`/api/payroll/summary/${testShop._id}?month=${new Date().getMonth() + 1}&year=${new Date().getFullYear()}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.totalEmployees).toBeDefined();
            expect(response.body.totalAmount).toBeDefined();
            expect(response.body.entries).toBeInstanceOf(Array);
        });
    });

    describe('POST /api/payroll/approve/:payrollId', () => {
        it('should approve payroll entry', async () => {
            // First generate a payroll entry
            const generateResponse = await request(app)
                .post(`/api/payroll/generate/${testShop._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    month: new Date().getMonth() + 1,
                    year: new Date().getFullYear()
                });

            const payrollId = generateResponse.body[0]._id;

            const response = await request(app)
                .post(`/api/payroll/approve/${payrollId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.isApproved).toBe(true);
            expect(response.body.status).toBe('approved');
        });
    });

    describe('GET /api/payroll/:payrollId', () => {
        it('should return individual payroll entry', async () => {
            // First generate a payroll entry
            const generateResponse = await request(app)
                .post(`/api/payroll/generate/${testShop._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    month: new Date().getMonth() + 1,
                    year: new Date().getFullYear()
                });

            const payrollId = generateResponse.body[0]._id;

            const response = await request(app)
                .get(`/api/payroll/${payrollId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body._id.toString()).toBe(payrollId.toString());
            expect(response.body.employee).toBeDefined();
            expect(response.body.shop).toBeDefined();
        });
    });
}); 