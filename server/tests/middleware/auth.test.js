const jwt = require('jsonwebtoken');
const { verifyToken, checkRole } = require('../../middleware/auth');
const User = require('../../models/User');
const statusCodes = require('../../utils/statusCodes');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  describe('verifyToken', () => {
    it('should pass if token is valid', () => {
      const token = jwt.sign({ id: '123' }, process.env.JWT_SECRET);
      req.headers.authorization = `Bearer ${token}`;
      verifyToken(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('should fail if token is missing', () => {
      verifyToken(req, res, next);
      expect(res.status).toHaveBeenCalledWith(statusCodes.UNAUTHORIZED);
    });

    it('should fail if token is invalid', () => {
      req.headers.authorization = 'Bearer invalid_token';
      verifyToken(req, res, next);
      expect(res.status).toHaveBeenCalledWith(statusCodes.UNAUTHORIZED);
    });
  });

  describe('checkRole', () => {
    it('should pass if user has required role', async () => {
      req.userId = '123';
      User.findById = jest.fn().mockResolvedValue({ role: 'Admin' });
      await checkRole(['Admin'])(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('should fail if user does not have required role', async () => {
      req.userId = '123';
      User.findById = jest.fn().mockResolvedValue({ role: 'Client' });
      await checkRole(['Admin'])(req, res, next);
      expect(res.status).toHaveBeenCalledWith(statusCodes.FORBIDDEN);
    });

    it('should fail if user is not found', async () => {
      req.userId = '123';
      User.findById = jest.fn().mockResolvedValue(null);
      await checkRole(['Admin'])(req, res, next);
      expect(res.status).toHaveBeenCalledWith(statusCodes.NOT_FOUND);
    });
  });
}); 