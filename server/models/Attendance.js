const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  date: { type: Date, required: true },
  checkIn: { 
    time: { type: Date },
    method: { type: String, enum: ['manual', 'qr'] }
  },
  checkOut: { 
    time: { type: Date },
    method: { type: String, enum: ['manual', 'qr'] }
  },
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