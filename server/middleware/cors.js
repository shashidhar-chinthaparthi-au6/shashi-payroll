const cors = require('cors');
const config = require('../config/config');

const corsOptions = {
  origin: config[process.env.NODE_ENV || 'development'].cors.origin,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

module.exports = cors(corsOptions); 