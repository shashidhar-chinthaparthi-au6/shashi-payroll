const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Employee = require('../models/Employee');
const Shop = require('../models/Shop');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const path = require('path');

describe('Employee Routes', () => {
  let clientToken;
  let clientId;
  let shopId;
  let testEmployee;

  beforeEach(async () => {
    await User.deleteMany({});
    await Shop.deleteMany({});
    await Employee.deleteMany({});

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

    // Create test shop
    const shop = await Shop.create({
      name: 'Test Shop',
      address: { street: '123 St', city: 'City', state: 'State', zipCode: '12345' },
      phone: '1234567890',
      email: 'shop@test.com',
      owner: clientId
    });
    shopId = shop._id;
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Shop.deleteMany({});
    await Employee.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /api/employees', () => {
    it('should create a new employee', async () => {
      const employeeData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        phone: '1234567890',
        position: 'Manager',
        shop: shopId
      };

      const response = await request(app)
        .post('/api/employees')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(employeeData);

      expect(response.status).toBe(201);
      expect(response.body.firstName).toBe(employeeData.firstName);
      expect(response.body.shop.toString()).toBe(shopId.toString());
    });

    it('should not create employee without authentication', async () => {
      const response = await request(app)
        .post('/api/employees')
        .send({});

      expect(response.status).toBe(401);
    });

    it('should not create employee for non-owned shop', async () => {
      const otherClient = await User.create({
        name: 'Other Client',
        email: 'other@test.com',
        password: 'password123',
        role: 'client'
      });
      const otherShop = await Shop.create({
        name: 'Other Shop',
        address: { street: '456 St', city: 'City', state: 'State', zipCode: '12345' },
        phone: '0987654321',
        email: 'other@test.com',
        owner: otherClient._id
      });
      const otherToken = jwt.sign({ _id: otherClient._id }, config[process.env.NODE_ENV || 'development'].jwt.secret);

      const response = await request(app)
        .post('/api/employees')
        .set('Authorization', `Bearer ${otherToken}`)
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@test.com',
          phone: '1234567890',
          position: 'Manager',
          shop: shopId
        });

      expect(response.status).toBe(403);
    });
  });

  describe('POST /api/employees/:id/documents', () => {
    beforeEach(async () => {
      testEmployee = await Employee.create({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        phone: '1234567890',
        position: 'Manager',
        shop: shopId
      });
    });

    it('should upload employee document', async () => {
      const response = await request(app)
        .post(`/api/employees/${testEmployee._id}/documents`)
        .set('Authorization', `Bearer ${clientToken}`)
        .field('type', 'photo')
        .attach('document', path.join(__dirname, 'fixtures/test-image.jpg'));

      expect(response.status).toBe(201);
      expect(response.body.documents).toHaveLength(1);
      expect(response.body.documents[0].type).toBe('photo');
    });

    it('should not upload document without file', async () => {
      const response = await request(app)
        .post(`/api/employees/${testEmployee._id}/documents`)
        .set('Authorization', `Bearer ${clientToken}`)
        .field('type', 'photo');

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/employees/shop/:shopId', () => {
    beforeEach(async () => {
      await Employee.create([
        {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@test.com',
          phone: '1234567890',
          position: 'Manager',
          shop: shopId
        },
        {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@test.com',
          phone: '0987654321',
          position: 'Assistant',
          shop: shopId
        }
      ]);
    });

    it('should get all employees for a shop', async () => {
      const response = await request(app)
        .get(`/api/employees/shop/${shopId}`)
        .set('Authorization', `Bearer ${clientToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });

    it('should not allow access to non-owned shop employees', async () => {
      const otherClient = await User.create({
        name: 'Other Client',
        email: 'other@test.com',
        password: 'password123',
        role: 'client'
      });
      const otherToken = jwt.sign({ _id: otherClient._id }, config[process.env.NODE_ENV || 'development'].jwt.secret);

      const response = await request(app)
        .get(`/api/employees/shop/${shopId}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/employees/:id', () => {
    beforeEach(async () => {
      testEmployee = await Employee.create({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        phone: '1234567890',
        position: 'Manager',
        shop: shopId
      });
    });

    it('should get employee by id', async () => {
      const response = await request(app)
        .get(`/api/employees/${testEmployee._id}`)
        .set('Authorization', `Bearer ${clientToken}`);

      expect(response.status).toBe(200);
      expect(response.body._id.toString()).toBe(testEmployee._id.toString());
    });

    it('should not allow access to non-owned shop employee', async () => {
      const otherClient = await User.create({
        name: 'Other Client',
        email: 'other@test.com',
        password: 'password123',
        role: 'client'
      });
      const otherToken = jwt.sign({ _id: otherClient._id }, config[process.env.NODE_ENV || 'development'].jwt.secret);

      const response = await request(app)
        .get(`/api/employees/${testEmployee._id}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('PATCH /api/employees/:id', () => {
    beforeEach(async () => {
      testEmployee = await Employee.create({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        phone: '1234567890',
        position: 'Manager',
        shop: shopId
      });
    });

    it('should update employee', async () => {
      const updates = {
        firstName: 'Johnny',
        position: 'Senior Manager'
      };

      const response = await request(app)
        .patch(`/api/employees/${testEmployee._id}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send(updates);

      expect(response.status).toBe(200);
      expect(response.body.firstName).toBe(updates.firstName);
      expect(response.body.position).toBe(updates.position);
    });

    it('should not allow non-owner to update employee', async () => {
      const otherClient = await User.create({
        name: 'Other Client',
        email: 'other@test.com',
        password: 'password123',
        role: 'client'
      });
      const otherToken = jwt.sign({ _id: otherClient._id }, config[process.env.NODE_ENV || 'development'].jwt.secret);

      const response = await request(app)
        .patch(`/api/employees/${testEmployee._id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ firstName: 'Johnny' });

      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /api/employees/:id', () => {
    beforeEach(async () => {
      testEmployee = await Employee.create({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        phone: '1234567890',
        position: 'Manager',
        shop: shopId
      });
    });

    it('should delete employee', async () => {
      const response = await request(app)
        .delete(`/api/employees/${testEmployee._id}`)
        .set('Authorization', `Bearer ${clientToken}`);

      expect(response.status).toBe(200);
      
      const employee = await Employee.findById(testEmployee._id);
      expect(employee).toBeNull();
    });

    it('should not allow non-owner to delete employee', async () => {
      const otherClient = await User.create({
        name: 'Other Client',
        email: 'other@test.com',
        password: 'password123',
        role: 'client'
      });
      const otherToken = jwt.sign({ _id: otherClient._id }, config[process.env.NODE_ENV || 'development'].jwt.secret);

      const response = await request(app)
        .delete(`/api/employees/${testEmployee._id}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(response.status).toBe(403);
    });
  });
}); 