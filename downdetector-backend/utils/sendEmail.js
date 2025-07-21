// downdetector-backend/utils/sendEmail.js
const sgMail = require('@sendgrid/mail');
require('dotenv').config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (to, subject, text) => {
  const msg = {
    to,
    from: 'noreply@downdetector.com', // must be a verified sender in SendGrid
    subject,
    text,
  };

  try {
    await sgMail.send(msg);
    console.log(`✅ Email sent to ${to}`);
  } catch (error) {
    console.error('❌ Failed to send email:', error.response?.body || error.message);
  }
};

module.exports = sendEmail;
