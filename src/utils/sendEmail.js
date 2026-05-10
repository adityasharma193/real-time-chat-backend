const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },

  tls: {
    rejectUnauthorized: false,
  },
});

const sendOTP = async (email, otp) => {

  try {

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      html: `
        <h2>OTP Verification</h2>
        <h1>${otp}</h1>
        <p>Expires in 10 minutes.</p>
      `,
    });

    console.log("✅ OTP Email Sent");

  } catch (err) {

    console.error("❌ Email send failed:", err);

    throw err;
  }
};

module.exports = { sendOTP };