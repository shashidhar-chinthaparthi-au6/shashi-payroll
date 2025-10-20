const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'client', 'employee'], required: true },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: function() {
    return this.role === 'client' || this.role === 'employee';
  }}
});

module.exports = mongoose.model('User', userSchema); 