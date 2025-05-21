const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  position: { type: String, required: true },
  joinDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
});

// Indexes for faster queries
employeeSchema.index({ email: 1 });

module.exports = mongoose.model('Employee', employeeSchema); 