const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  position: {
    type: String,
    required: true,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true
  },
  dailySalary: {
    type: Number,
    required: true,
    default: 1000
  },
  documents: [{
    type: {
      type: String,
      required: true,
      enum: ['photo', 'id', 'resume', 'other']
    },
    fileName: String,
    filePath: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for faster queries
employeeSchema.index({ shop: 1 });
employeeSchema.index({ email: 1 });
employeeSchema.index({ firstName: 1, lastName: 1 });

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee; 