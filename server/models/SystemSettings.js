const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema({
  // singleton (one doc) - global settings
  defaultCurrency: { type: String, default: 'INR' },
  defaultTimezone: { type: String, default: 'UTC' },
  emailNotifications: { type: Boolean, default: true },
  maintenanceMode: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);


