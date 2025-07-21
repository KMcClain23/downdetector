// cron/schedule.js
const cron = require('node-cron');
const Subscriber = require('../models/Subscriber');
const Outage = require('../models/Outage');
const scrapeOutageStatus = require('../utils/scraper');
const sendOutageEmail = require('../utils/emailer');

const ISPS = ['ziply', 'xfinity', 'spectrum', 'verizon', 'centurylink'];

cron.schedule('*/15 * * * *', async () => {
  console.log('🔄 Running outage check job...');

  const zipCodes = await Subscriber.distinct('zipCode');

  for (const zip of zipCodes) {
    for (const isp of ISPS) {
      try {
        const data = await scrapeOutageStatus(zip, isp);

        if (data.status === 'suspected') {
          const exists = await Outage.findOne({
            zipCode: zip,
            isp,
            status: 'suspected',
            reportedAt: { $gte: new Date(Date.now() - 1000 * 60 * 60) }, // last 1 hour
          });

          if (!exists) {
            const newOutage = new Outage({
              zipCode: zip,
              isp,
              status: 'suspected',
              description: data.summary.slice(0, 300),
              reportedAt: new Date(),
            });

            await newOutage.save();

            const subscribers = await Subscriber.find({ zipCode: zip });
            for (const sub of subscribers) {
              console.log(`📬 Emailing ${sub.email} for ${isp} in ${zip}`);
              await sendOutageEmail(sub.email, zip);
            }

            console.log(`✅ Alert sent for ${isp} outage in ${zip}`);
          }
        }
      } catch (err) {
        console.error(`❌ Error scraping ${isp} for ${zip}:`, err.message);
      }
    }
  }
});
