const mongoose = require('mongoose');

const payslipSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: true
  },
  basicSalary: {
    type: Number,
    required: true
  },
  allowances: [{
    type: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    }
  }],
  deductions: [{
    type: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    }
  }],
  netSalary: {
    type: Number,
    required: true
  },
  attendance: {
    present: { type: Number, default: 0 },
    absent: { type: Number, default: 0 },
    late: { type: Number, default: 0 },
    halfDay: { type: Number, default: 0 }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  generatedAt: { type: Date, default: Date.now },
  approvedAt: { type: Date },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  pdfUrl: { type: String }
}, { timestamps: true });

// Indexes for faster queries
payslipSchema.index({ userId: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Payslip', payslipSchema); 