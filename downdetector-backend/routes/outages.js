// routes/outages.js
const express = require('express');
const router = express.Router();
const Outage = require('../models/Outage');
const Subscriber = require('../models/Subscriber');
const sendOutageEmail = require('../utils/emailer');
const scrapeOutageStatus = require('../utils/scraper');

const ISPS = ['ziply', 'xfinity', 'spectrum', 'verizon', 'centurylink'];

// GET all outage records for a ZIP
router.get('/:zip', async (req, res, next) => {
  if (req.path.startsWith('/scrape')) return next();
  const { zip } = req.params;
  try {
    const outages = await Outage.find({ zipCode: zip }).sort({ reportedAt: -1 });
    res.json(outages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST mock outage
router.post('/mock', async (req, res) => {
  const { zipCode = '97229' } = req.body;

  try {
    const outage = new Outage({
      zipCode,
      isp: 'Ziply Fiber',
      status: 'suspected',
      reportedAt: new Date(),
      description: 'Mocked outage for testing',
    });

    await outage.save();

    const subscribers = await Subscriber.find({ zipCode });
    for (const sub of subscribers) {
      console.log(`📬 Sending email to ${sub.email}`);
      await sendOutageEmail(sub.email, zipCode);
    }

    console.log(`✅ All emails sent for zip ${zipCode}`);
    res.status(201).json({ message: 'Mock outage created and emails sent!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET scrape all ISPs for a ZIP
router.get('/scrape/:zip', async (req, res) => {
  const { zip } = req.params;
  const results = [];

  try {
    for (const isp of ISPS) {
      const data = await scrapeOutageStatus(zip, isp);
      results.push({ isp, ...data });

      // Only log and notify if status is 'suspected'
      if (data.status === 'suspected') {
        const alreadyExists = await Outage.findOne({
          zipCode: zip,
          isp,
          status: 'suspected',
          description: { $regex: data.summary.slice(0, 100), $options: 'i' },
        });

        if (!alreadyExists) {
          const outage = new Outage({
            zipCode: zip,
            isp,
            status: 'suspected',
            reportedAt: new Date(),
            description: data.summary.slice(0, 500),
          });

          await outage.save();

          const subscribers = await Subscriber.find({ zipCode: zip });
          for (const sub of subscribers) {
            console.log(`📬 Alerting ${sub.email} about ${isp} outage in ${zip}`);
            await sendOutageEmail(sub.email, zip, isp);
          }

          console.log(`📦 Logged new outage for ${isp} in ${zip}`);
        } else {
          console.log(`🟡 Outage for ${isp} in ${zip} already logged.`);
        }
      }
    }

    res.json(results);
  } catch (err) {
    console.error('❌ Scrape failed:', err.message);
    res.status(500).json({ error: 'Failed to scrape some or all ISPs' });
  }
});

module.exports = router;
