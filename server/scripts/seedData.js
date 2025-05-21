const mongoose = require('mongoose');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Notification = require('../models/Notification');
const Event = require('../models/Event');

const MONGODB_URI = 'mongodb://localhost:27017/payroll';

async function seedData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      Employee.deleteMany({}),
      Attendance.deleteMany({}),
      Notification.deleteMany({}),
      Event.deleteMany({})
    ]);

    // Create test employee
    const employee = await Employee.create({
      name: 'John Doe',
      email: 'john.doe@example.com',
      department: 'Engineering',
      position: 'Senior Developer'
    });

    // Create today's attendance
    const today = new Date();
    await Attendance.create({
      employeeId: employee._id,
      date: today,
      checkIn: new Date(today.setHours(9, 0, 0, 0)),
      status: 'present'
    });

    // Create notifications
    await Notification.create([
      {
        employeeId: employee._id,
        title: 'Payslip Generated',
        message: 'Your salary for March 2024 has been processed',
        type: 'success',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        employeeId: employee._id,
        title: 'Leave Approved',
        message: 'Your leave request for April 15-16 has been approved',
        type: 'info',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
      },
      {
        employeeId: employee._id,
        title: 'Attendance Reminder',
        message: 'Don\'t forget to check in tomorrow',
        type: 'warning',
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000) // 2 days ago
      }
    ]);

    // Create events
    await Event.create([
      {
        title: 'Good Friday',
        startDate: new Date('2024-03-29'),
        endDate: new Date('2024-03-29'),
        type: 'holiday'
      },
      {
        title: 'Annual Leave',
        startDate: new Date('2024-04-15'),
        endDate: new Date('2024-04-16'),
        type: 'leave',
        employeeId: employee._id,
        status: 'approved'
      },
      {
        title: 'Easter Monday',
        startDate: new Date('2024-04-01'),
        endDate: new Date('2024-04-01'),
        type: 'holiday'
      }
    ]);

    console.log('Test data seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedData(); 