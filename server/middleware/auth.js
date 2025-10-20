const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
exports.verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-secret');
    req.userId = decoded.id;
    req.userRole = decoded.role; // Add role to request object
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Middleware to populate user object
exports.populateUser = async (req, res, next) => {
  try {
    if (req.userId) {
      const user = await User.findById(req.userId).lean();
      if (user) {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    return res.status(500).json({ message: 'Error populating user' });
  }
};

// Middleware to check if user has required role
exports.checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.userRole) {
      return res.status(401).json({ message: 'No role found in token' });
    }

    if (!roles.includes(req.userRole)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    next();
  };
}; 