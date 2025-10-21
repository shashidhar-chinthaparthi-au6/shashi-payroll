const express = require('express');
const mongoose = require('mongoose');
const corsMiddleware = require('./middleware/cors');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');
const redisClient = require('./utils/redis');

// Fix Mongoose deprecation warning
mongoose.set('strictQuery', false);
const authRoutes = require('./routes/auth');
const attendanceRoutes = require('./routes/attendance');
const adminRouter = require('./routes/admin');
const clientRoutes = require('./routes/client');
const config = require('./config/config');
const path = require('path');

const app = express();
app.use(express.json());
app.use(corsMiddleware);

// Serve uploads as static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  const health = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    redis: redisClient.connected || redisClient.ready ? 'connected' : 'disconnected',
    status: 'healthy'
  };
  res.json(health);
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Payroll API Server',
    status: 'running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Connect to MongoDB with better error handling
const connectToMongoDB = async () => {
  try {
    await mongoose.connect(config[process.env.NODE_ENV || 'development'].mongodb.uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4,
      maxPoolSize: 10,
      retryWrites: true,
      w: 'majority'
    });
    logger.info('Connected to MongoDB');
  } catch (err) {
    logger.error('MongoDB connection error:', err.message);
    // Don't crash the app if MongoDB fails
    console.log('Server will continue without MongoDB connection');
  }
};

// Connect to MongoDB
connectToMongoDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leave', require('./routes/leave'));
app.use('/api/admin', adminRouter);
app.use('/api/client', clientRoutes);
app.use('/api/employee', require('./routes/employee'));
app.use('/api/contractor', require('./routes/contractor'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/pdf', require('./routes/pdf'));

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
console.log(PORT);
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
}

module.exports = app; 