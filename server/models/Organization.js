const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  type: { type: String, default: 'company' },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  settings: {
    timezone: { type: String, default: 'UTC' },
    currency: { type: String, default: 'USD' },
  },
  address: {
    line1: String,
    line2: String,
    city: String,
    state: String,
    country: String,
    zip: String,
  },
  contact: {
    email: String,
    phone: String,
  },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

organizationSchema.index({ name: 1 });

module.exports = mongoose.model('Organization', organizationSchema);


