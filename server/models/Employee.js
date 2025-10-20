const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  type: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  fileName: String,
  filePath: String,
  uploadedAt: { type: Date, default: Date.now },
  verifiedAt: Date,
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rejectionReason: String
});

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  position: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  joinDate: { type: Date, default: Date.now },
  hireDate: { type: Date },
  salary: { type: Number, default: 0 },
  employmentType: { type: String, enum: ['full_time', 'part_time', 'contract', 'intern'], default: 'full_time' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  documents: [documentSchema],
  phone: String,
  address: String,
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  },
  bankDetails: {
    accountNumber: String,
    bankName: String,
    ifscCode: String
  },
  settings: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    },
    theme: { type: String, enum: ['light', 'dark'], default: 'light' }
  }
}, {
  timestamps: true
});

// Indexes for faster queries
employeeSchema.index({ email: 1 });
employeeSchema.index({ userId: 1 });

module.exports = mongoose.model('Employee', employeeSchema); 