const express = require('express');
const mongoose = require('mongoose');
const corsMiddleware = require('./middleware/cors');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');
const redisClient = require('./utils/redis');
const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employeeRoutes');
const attendanceRoutes = require('./routes/attendance');
const payrollRoutes = require('./routes/payroll');
const payslipRoutes = require('./routes/payslipRoutes');
const userRoutes = require('./routes/userRoutes');
const dashboardRoutes = require('./routes/dashboard');
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
    redis: redisClient.connected ? 'connected' : 'disconnected'
  };
  res.json(health);
});

// Connect to MongoDB
mongoose.connect(config[process.env.NODE_ENV || 'development'].mongodb.uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,
  maxPoolSize: 10,
  retryWrites: true,
  w: 'majority'
})
  .then(() => logger.info('Connected to MongoDB'))
  .catch(err => logger.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/payslips', payslipRoutes);
app.use('/api/users', userRoutes);
app.use('/api/leave', require('./routes/leave'));
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRouter);
app.use('/api/client', clientRoutes);
app.use('/api/employee', require('./routes/employee'));

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
console.log(PORT);
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
}

module.exports = app; 