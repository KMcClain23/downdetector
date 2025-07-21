// routes/subscriptions.js
const express = require('express');
const router = express.Router();
const Subscriber = require('../models/Subscriber');

// POST /api/subscribe
router.post('/', async (req, res) => {
  const { email, zipCode } = req.body;

  if (!email || !zipCode) {
    return res.status(400).json({ error: 'Email and zipCode are required.' });
  }

  try {
    const existing = await Subscriber.findOne({ email, zipCode });

    if (existing) {
      return res.status(200).json({ message: 'Already subscribed.' });
    }

    const newSub = new Subscriber({ email, zipCode });
    await newSub.save();

    res.status(201).json({ message: 'Subscribed successfully.' });
  } catch (err) {
    console.error('❌ Error subscribing user:', err.message);
    res.status(500).json({ error: 'Failed to subscribe.' });
  }
});

module.exports = router;
