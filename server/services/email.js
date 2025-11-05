const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});

async function sendPasswordReset(email, resetUrl) {
  const info = await transporter.sendMail({
    from: '"PSM 150" <no-reply@psm150.dev>',
    to: email,
    subject: 'Reset your password',
    text: `Click this link to reset your password: ${resetUrl}`,
    html: `<p>Click this link to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`
  });
  return info;
}

module.exports = { sendPasswordReset };
