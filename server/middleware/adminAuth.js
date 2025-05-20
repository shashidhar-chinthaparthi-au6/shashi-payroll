const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/User');

const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, config[process.env.NODE_ENV || 'development'].jwt.secret);
    const user = await User.findOne({ _id: decoded._id });

    if (!user) {
      throw new Error();
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }

    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate.' });
  }
};

module.exports = adminAuth; 