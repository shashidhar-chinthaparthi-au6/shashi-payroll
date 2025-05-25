const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  checkIn: {
    time: { type: Date },
    method: { type: String, enum: ['manual', 'qr', 'biometric'] }
  },
  checkOut: {
    time: { type: Date },
    method: { type: String, enum: ['manual', 'qr', 'biometric']}
  },
  status: { 
    type: String, 
    enum: ['present', 'absent', 'late', 'half-day'], 
    default: 'absent' 
  },
  notes: { type: String }
}, { timestamps: true });

// Indexes for faster queries
attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema); 