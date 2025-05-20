const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
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
    daysWorked: {
        type: Number,
        required: true,
        min: 0
    },
    dailySalary: {
        type: Number,
        required: true,
        min: 0
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    allowances: [{
        name: String,
        amount: Number
    }],
    deductions: [{
        name: String,
        amount: Number
    }],
    isApproved: {
        type: Boolean,
        default: false
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedAt: {
        type: Date
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'paid'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
payrollSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Calculate total amount before saving
payrollSchema.pre('save', function(next) {
    this.totalAmount = this.daysWorked * this.dailySalary;
    next();
});

const Payroll = mongoose.model('Payroll', payrollSchema);

module.exports = Payroll; 