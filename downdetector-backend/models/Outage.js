// downdetector-backend/models/Outage.js
const mongoose = require('mongoose');

const OutageSchema = new mongoose.Schema({
  zipCode: { type: String, required: true },
  isp: { type: String, required: true },
  status: {
    type: String,
    enum: ['suspected', 'confirmed', 'cleared'],
    default: 'suspected',
  },
  reportedAt: { type: Date, default: Date.now },
  source: {
    type: String,
    enum: ['user', 'scraper'],
    default: 'scraper',
  },
  description: String,
});

module.exports = mongoose.model('Outage', OutageSchema);
