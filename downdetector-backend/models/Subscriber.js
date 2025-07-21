const mongoose = require('mongoose');

const SubscriberSchema = new mongoose.Schema({
  zipCode: String,
  email: { type: String, required: true },
});

module.exports = mongoose.models.Subscriber || mongoose.model('Subscriber', SubscriberSchema);
