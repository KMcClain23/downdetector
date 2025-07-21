const mongoose = require('mongoose');

const alertLogSchema = new mongoose.Schema({
  email: String,
  zipCode: String,
  isp: String,
  sentAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('AlertLog', alertLogSchema);
