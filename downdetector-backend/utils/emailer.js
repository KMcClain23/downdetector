const sgMail = require('@sendgrid/mail');
const AlertLog = require('../models/AlertLog');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendOutageEmail(to, zipCode, isp) {
  const msg = {
    to,
    from: 'alerts@downdetector.com',
    subject: `Outage Alert for ${zipCode}`,
    text: `Heads up! There's a reported outage for ${isp} in your area (${zipCode}).`,
    html: `<p><strong>Heads up!</strong> There's a reported outage for <strong>${isp}</strong> in your area (<code>${zipCode}</code>).</p>`,
  };

  try {
    await sgMail.send(msg);
    console.log(`📧 Email sent to ${to}`);

    // Log the alert
    await AlertLog.create({ email: to, zipCode, isp });
  } catch (error) {
    console.error('❌ Error sending email:', error.response?.body || error.message);
  }
}

module.exports = sendOutageEmail;
