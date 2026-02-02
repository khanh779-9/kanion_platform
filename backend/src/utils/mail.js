const nodemailer = require('nodemailer');

// Tạo transporter với cấu hình SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.example.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true cho port 465, false cho các port khác
  auth: {
    user: process.env.SMTP_USER || 'your@email.com',
    pass: process.env.SMTP_PASS || 'yourpassword',
  },
});

/**
 * Gửi email
 * @param {string} to - Địa chỉ email nhận
 * @param {string} subject - Tiêu đề
 * @param {string} text - Nội dung text
 * @param {string} [html] - Nội dung HTML (tùy chọn)
 */
async function sendMail({ to, subject, text, html }) {
  const mailOptions = {
    from: process.env.SMTP_FROM || 'no-reply@example.com',
    to,
    subject,
    text,
    html,
  };
  return transporter.sendMail(mailOptions);
}

module.exports = { sendMail };