const mongoose = require('mongoose');

const contractAssignmentSchema = new mongoose.Schema({
  contractorEmployee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  title: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  rateType: { type: String, enum: ['hourly', 'daily', 'monthly', 'fixed'], default: 'hourly' },
  rateAmount: { type: Number, default: 0 },
  billingCurrency: { type: String, default: 'USD' },
  costCenter: { type: String },
  status: { type: String, enum: ['active', 'inactive', 'completed'], default: 'active' },
}, { timestamps: true });

contractAssignmentSchema.index({ contractorEmployee: 1 });
contractAssignmentSchema.index({ organizationId: 1 });

module.exports = mongoose.model('ContractAssignment', contractAssignmentSchema);


