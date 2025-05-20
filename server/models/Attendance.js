const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
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
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  checkIn: {
    time: {
      type: Date,
      required: true
    },
    method: {
      type: String,
      enum: ['manual', 'qr'],
      required: true
    }
  },
  checkOut: {
    time: {
      type: Date,
      required: false
    },
    method: {
      type: String,
      enum: ['manual', 'qr'],
      required: false
    },
    required: false
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late'],
    default: 'present'
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate check-ins for the same employee on the same day
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

// Index for faster queries
attendanceSchema.index({ shop: 1 });
attendanceSchema.index({ date: 1 });

// Add pre-save hook to log changes
attendanceSchema.pre('save', function(next) {
  const logObj = {
    id: this._id,
    employee: this.employee,
    date: this.date,
    hasCheckIn: !!this.checkIn,
    isModified: this.isModified(),
    modifiedPaths: this.modifiedPaths()
  };
  if (this.checkOut && this.checkOut.time) {
    logObj.hasCheckOut = true;
  }
  console.log('Saving attendance record:', logObj);
  next();
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance; 