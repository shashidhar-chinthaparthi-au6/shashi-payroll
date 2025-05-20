const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const app = require('../app');
const User = require('../models/User');
const statusCodes = require('../utils/statusCodes');

let server;

beforeAll(async () => {
  server = app.listen(0); // Use a random port for testing
});

afterAll(async () => {
  await server.close();
  await mongoose.connection.close();
});

describe('Auth Routes', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/auth/register/admin', () => {
    it('should register an admin successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register/admin')
        .send({ name: 'Admin', email: 'admin@example.com', password: 'password' });
      expect(res.status).toBe(statusCodes.CREATED);
      expect(res.body.success).toBe(true);
    });

    it('should fail if email is already registered', async () => {
      await User.create({ name: 'Admin', email: 'admin@example.com', password: 'password', role: 'admin' });
      const res = await request(app)
        .post('/api/auth/register/admin')
        .send({ name: 'Admin', email: 'admin@example.com', password: 'password' });
      expect(res.status).toBe(statusCodes.BAD_REQUEST);
    });
  });

  describe('POST /api/auth/register/client', () => {
    it('should register a client successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register/client')
        .send({ name: 'Client', email: 'client@example.com', password: 'password' });
      expect(res.status).toBe(statusCodes.CREATED);
      expect(res.body.success).toBe(true);
    });

    it('should fail if email is already registered', async () => {
      await User.create({ name: 'Client', email: 'client@example.com', password: 'password', role: 'client' });
      const res = await request(app)
        .post('/api/auth/register/client')
        .send({ name: 'Client', email: 'client@example.com', password: 'password' });
      expect(res.status).toBe(statusCodes.BAD_REQUEST);
    });
  });

  describe('POST /api/auth/login/admin', () => {
    it('should login an admin successfully', async () => {
      const hashedPassword = await bcrypt.hash('password', 10);
      await User.create({ name: 'Admin', email: 'admin@example.com', password: hashedPassword, role: 'admin' });
      const res = await request(app)
        .post('/api/auth/login/admin')
        .send({ email: 'admin@example.com', password: 'password' });
      expect(res.status).toBe(statusCodes.OK);
      expect(res.body.data.token).toBeDefined();
    });

    it('should fail if credentials are invalid', async () => {
      const res = await request(app)
        .post('/api/auth/login/admin')
        .send({ email: 'admin@example.com', password: 'wrongpassword' });
      expect(res.status).toBe(statusCodes.UNAUTHORIZED);
    });
  });

  describe('POST /api/auth/login/client', () => {
    it('should login a client successfully', async () => {
      const hashedPassword = await bcrypt.hash('password', 10);
      await User.create({ name: 'Client', email: 'client@example.com', password: hashedPassword, role: 'client' });
      const res = await request(app)
        .post('/api/auth/login/client')
        .send({ email: 'client@example.com', password: 'password' });
      expect(res.status).toBe(statusCodes.OK);
      expect(res.body.data.token).toBeDefined();
    });

    it('should fail if credentials are invalid', async () => {
      const res = await request(app)
        .post('/api/auth/login/client')
        .send({ email: 'client@example.com', password: 'wrongpassword' });
      expect(res.status).toBe(statusCodes.UNAUTHORIZED);
    });
  });

  describe('POST /api/auth/login/employee', () => {
    it('should login an employee successfully', async () => {
      const hashedPassword = await bcrypt.hash('password', 10);
      await User.create({ name: 'Employee', email: 'employee@example.com', password: hashedPassword, role: 'employee' });
      const res = await request(app)
        .post('/api/auth/login/employee')
        .send({ email: 'employee@example.com', password: 'password' });
      expect(res.status).toBe(statusCodes.OK);
      expect(res.body.data.token).toBeDefined();
    });

    it('should fail if credentials are invalid', async () => {
      const res = await request(app)
        .post('/api/auth/login/employee')
        .send({ email: 'employee@example.com', password: 'wrongpassword' });
      expect(res.status).toBe(statusCodes.UNAUTHORIZED);
    });
  });
}); 