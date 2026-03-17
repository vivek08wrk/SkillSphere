const nodemailer = require('nodemailer');

// Gmail transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async (emailData) => {
  try {
    // Console mein print karo — development ke liye
    console.log('─────────────────────────────────');
    console.log('📧 EMAIL SENDING...');
    console.log(`To      : ${emailData.to}`);
    console.log(`Subject : ${emailData.subject}`);
    console.log('─────────────────────────────────');

    // Real email bhejo
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html || emailData.body
    });

    console.log('✅ Email sent successfully!');
  } catch (err) {
    console.error('❌ Email send failed:', err.message);
  }
};

module.exports = { sendEmail };