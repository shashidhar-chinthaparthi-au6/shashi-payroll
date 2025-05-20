const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const config = require('../../config/config');

describe('Admin Authentication Middleware', () => {
  let adminToken;
  let clientToken;
  let adminId;
  let clientId;

  beforeAll(async () => {
    // Create test admin user
    const admin = new User({
      name: 'Test Admin',
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin'
    });
    await admin.save();
    adminId = admin._id;
    adminToken = jwt.sign({ _id: admin._id }, config[process.env.NODE_ENV || 'development'].jwt.secret);

    // Create test client user
    const client = new User({
      name: 'Test Client',
      email: 'client@test.com',
      password: 'password123',
      role: 'client'
    });
    await client.save();
    clientId = client._id;
    clientToken = jwt.sign({ _id: client._id }, config[process.env.NODE_ENV || 'development'].jwt.secret);
  });

  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  it('should allow admin to access protected route', async () => {
    const response = await request(app)
      .get('/api/shops/all')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).not.toBe(403);
  });

  it('should not allow client to access admin route', async () => {
    const response = await request(app)
      .get('/api/shops/all')
      .set('Authorization', `Bearer ${clientToken}`);

    expect(response.status).toBe(403);
  });

  it('should not allow access without token', async () => {
    const response = await request(app)
      .get('/api/shops/all');

    expect(response.status).toBe(401);
  });

  it('should not allow access with invalid token', async () => {
    const response = await request(app)
      .get('/api/shops/all')
      .set('Authorization', 'Bearer invalid-token');

    expect(response.status).toBe(401);
  });
}); 