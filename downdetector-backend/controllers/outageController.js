// downdetector-backend/controllers/outageController.js
const Outage = require('../models/Outage');

exports.getOutagesByZip = async (req, res) => {
  try {
    const outages = await Outage.find({ zipCode: req.params.zip }).sort({ reportedAt: -1 });
    res.json(outages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addUserReport = async (req, res) => {
  try {
    const outage = new Outage({ ...req.body, source: 'user' });
    await outage.save();
    res.status(201).json(outage);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
