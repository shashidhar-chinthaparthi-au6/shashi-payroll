const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  type: { 
    type: String, 
    enum: ['holiday', 'leave'],
    required: true 
  },
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }, // null for holidays
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  description: String
});

module.exports = mongoose.model('Event', eventSchema); 