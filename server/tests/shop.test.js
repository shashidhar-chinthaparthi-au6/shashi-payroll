const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Shop = require('../models/Shop');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

describe('Shop Routes', () => {
  let clientToken;
  let adminToken;
  let clientId;
  let adminId;
  let testShop;

  beforeEach(async () => {
    await User.deleteMany({});
    await Shop.deleteMany({});

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
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Shop.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /api/shops', () => {
    it('should create a new shop for client', async () => {
      const shopData = {
        name: 'Test Shop',
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          zipCode: '12345'
        },
        phone: '1234567890',
        email: 'shop@test.com'
      };

      const response = await request(app)
        .post('/api/shops')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(shopData);

      expect(response.status).toBe(201);
      expect(response.body.name).toBe(shopData.name);
      expect(response.body.owner.toString()).toBe(clientId.toString());
    });

    it('should not create shop without authentication', async () => {
      const response = await request(app)
        .post('/api/shops')
        .send({});

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/shops/all', () => {
    it('should get all shops for admin', async () => {
      // Create test shops
      await Shop.create([
        {
          name: 'Shop 1',
          address: { street: '123 St', city: 'City', state: 'State', zipCode: '12345' },
          phone: '1234567890',
          email: 'shop1@test.com',
          owner: clientId
        },
        {
          name: 'Shop 2',
          address: { street: '456 St', city: 'City', state: 'State', zipCode: '12345' },
          phone: '0987654321',
          email: 'shop2@test.com',
          owner: clientId
        }
      ]);

      const response = await request(app)
        .get('/api/shops/all')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });

    it('should not allow non-admin to get all shops', async () => {
      const response = await request(app)
        .get('/api/shops/all')
        .set('Authorization', `Bearer ${clientToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/shops/my-shops', () => {
    it('should get client\'s shops', async () => {
      // Create test shops
      await Shop.create([
        {
          name: 'Shop 1',
          address: { street: '123 St', city: 'City', state: 'State', zipCode: '12345' },
          phone: '1234567890',
          email: 'shop1@test.com',
          owner: clientId
        },
        {
          name: 'Shop 2',
          address: { street: '456 St', city: 'City', state: 'State', zipCode: '12345' },
          phone: '0987654321',
          email: 'shop2@test.com',
          owner: clientId
        }
      ]);

      const response = await request(app)
        .get('/api/shops/my-shops')
        .set('Authorization', `Bearer ${clientToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });
  });

  describe('GET /api/shops/:id', () => {
    beforeEach(async () => {
      testShop = await Shop.create({
        name: 'Test Shop',
        address: { street: '123 St', city: 'City', state: 'State', zipCode: '12345' },
        phone: '1234567890',
        email: 'shop@test.com',
        owner: clientId
      });
    });

    it('should get shop by id for owner', async () => {
      const response = await request(app)
        .get(`/api/shops/${testShop._id}`)
        .set('Authorization', `Bearer ${clientToken}`);

      expect(response.status).toBe(200);
      expect(response.body._id.toString()).toBe(testShop._id.toString());
    });

    it('should get shop by id for admin', async () => {
      const response = await request(app)
        .get(`/api/shops/${testShop._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body._id.toString()).toBe(testShop._id.toString());
    });

    it('should not allow non-owner to get shop', async () => {
      const otherClient = await User.create({
        name: 'Other Client',
        email: 'other@test.com',
        password: 'password123',
        role: 'client'
      });
      const otherToken = jwt.sign({ _id: otherClient._id }, config[process.env.NODE_ENV || 'development'].jwt.secret);

      const response = await request(app)
        .get(`/api/shops/${testShop._id}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('PATCH /api/shops/:id', () => {
    beforeEach(async () => {
      testShop = await Shop.create({
        name: 'Test Shop',
        address: { street: '123 St', city: 'City', state: 'State', zipCode: '12345' },
        phone: '1234567890',
        email: 'shop@test.com',
        owner: clientId
      });
    });

    it('should update shop for owner', async () => {
      const updates = {
        name: 'Updated Shop',
        phone: '9876543210'
      };

      const response = await request(app)
        .patch(`/api/shops/${testShop._id}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send(updates);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe(updates.name);
      expect(response.body.phone).toBe(updates.phone);
    });

    it('should not allow non-owner to update shop', async () => {
      const otherClient = await User.create({
        name: 'Other Client',
        email: 'other@test.com',
        password: 'password123',
        role: 'client'
      });
      const otherToken = jwt.sign({ _id: otherClient._id }, config[process.env.NODE_ENV || 'development'].jwt.secret);

      const response = await request(app)
        .patch(`/api/shops/${testShop._id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ name: 'Updated Shop' });

      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /api/shops/:id', () => {
    beforeEach(async () => {
      testShop = await Shop.create({
        name: 'Test Shop',
        address: { street: '123 St', city: 'City', state: 'State', zipCode: '12345' },
        phone: '1234567890',
        email: 'shop@test.com',
        owner: clientId
      });
    });

    it('should delete shop for owner', async () => {
      const response = await request(app)
        .delete(`/api/shops/${testShop._id}`)
        .set('Authorization', `Bearer ${clientToken}`);

      expect(response.status).toBe(200);
      
      const shop = await Shop.findById(testShop._id);
      expect(shop).toBeNull();
    });

    it('should not allow non-owner to delete shop', async () => {
      const otherClient = await User.create({
        name: 'Other Client',
        email: 'other@test.com',
        password: 'password123',
        role: 'client'
      });
      const otherToken = jwt.sign({ _id: otherClient._id }, config[process.env.NODE_ENV || 'development'].jwt.secret);

      const response = await request(app)
        .delete(`/api/shops/${testShop._id}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(response.status).toBe(403);
    });
  });
}); 