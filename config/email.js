const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.APP_EMAIL,
    pass: process.env.EMAIL_PASS_KEY,
  },
});

const sendEmail = async (to, subject, text) => {
  const mailOptions = {
    from: process.env.APP_EMAIL,
    to,
    subject,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true
  } catch (error) {
    console.error("Error sending email:", error);
    return false
  }
};

module.exports = sendEmail;