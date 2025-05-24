const mongoose = require('mongoose');
const Attendance = require('../models/Attendance');
const config = require('../config/config');

async function createTestAttendance() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Set today's date to midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Create test attendance record
    const attendance = new Attendance({
      userId: '683192aab503adf1958f7f81', // The user ID from your request
      date: today,
      checkIn: {
        time: new Date(),
        method: 'manual'
      },
      status: 'present'
    });

    await attendance.save();
    console.log('Created test attendance record:', attendance);

  } catch (error) {
    console.error('Error creating test attendance:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
createTestAttendance(); 