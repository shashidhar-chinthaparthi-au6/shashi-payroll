const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  date: { type: Date, required: true },
  checkIn: { type: Date },
  checkOut: { type: Date },
  status: { 
    type: String, 
    enum: ['present', 'absent', 'late', 'half-day'],
    required: true 
  },
  notes: String
});

// Compound index for efficient queries
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema); 