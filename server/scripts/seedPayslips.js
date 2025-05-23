const mongoose = require('mongoose');
const Payslip = require('../models/Payslip');

const MONGODB_URI = 'mongodb://localhost:27017/payroll';

async function seedPayslips() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing payslips
    await Payslip.deleteMany({});

    // Create payslips for February and March 2024
    const payslips = [
      {
        employeeId: '682fe54b71870e49c8c2fe1c',
        month: 2, // February
        year: 2024,
        basicSalary: 50000,
        allowances: [
          { name: 'Housing Allowance', amount: 15000 },
          { name: 'Transport Allowance', amount: 5000 },
          { name: 'Special Allowance', amount: 10000 }
        ],
        deductions: [
          { name: 'Income Tax', amount: 5000 },
          { name: 'Professional Tax', amount: 200 },
          { name: 'PF', amount: 6000 }
        ],
        netSalary: 64800,
        attendance: {
          present: 22,
          absent: 1,
          late: 2,
          halfDay: 0
        },
        status: 'approved',
        generatedAt: new Date('2024-02-28'),
        approvedAt: new Date('2024-02-28'),
        pdfUrl: '/uploads/payslips/feb-2024.pdf'
      },
      {
        employeeId: '682fe54b71870e49c8c2fe1c',
        month: 3, // March
        year: 2024,
        basicSalary: 50000,
        allowances: [
          { name: 'Housing Allowance', amount: 15000 },
          { name: 'Transport Allowance', amount: 5000 },
          { name: 'Special Allowance', amount: 10000 }
        ],
        deductions: [
          { name: 'Income Tax', amount: 5000 },
          { name: 'Professional Tax', amount: 200 },
          { name: 'PF', amount: 6000 }
        ],
        netSalary: 64800,
        attendance: {
          present: 23,
          absent: 0,
          late: 1,
          halfDay: 1
        },
        status: 'approved',
        generatedAt: new Date('2024-03-31'),
        approvedAt: new Date('2024-03-31'),
        pdfUrl: '/uploads/payslips/mar-2024.pdf'
      }
    ];

    await Payslip.insertMany(payslips);
    console.log('Payslip data seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding payslip data:', error);
    process.exit(1);
  }
}

seedPayslips(); 