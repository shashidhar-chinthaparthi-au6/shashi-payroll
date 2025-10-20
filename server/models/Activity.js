const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['organization', 'user', 'contractor', 'contract', 'settings', 'system'], required: true },
  action: { type: String, required: true },
  meta: { type: Object },
}, { timestamps: true });

activitySchema.index({ createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);


