const mongoose = require('mongoose');

const payslipSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
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
    name: String,
    amount: Number
  }],
  deductions: [{
    name: String,
    amount: Number
  }],
  netSalary: {
    type: Number,
    required: true
  },
  attendance: {
    present: Number,
    absent: Number,
    late: Number,
    halfDay: Number
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  generatedAt: {
    type: Date,
    default: Date.now
  },
  approvedAt: {
    type: Date
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  pdfUrl: {
    type: String
  }
}, {
  timestamps: true
});

// Compound index to ensure unique payslip per employee per month/year
payslipSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

const Payslip = mongoose.model('Payslip', payslipSchema);

module.exports = Payslip; 