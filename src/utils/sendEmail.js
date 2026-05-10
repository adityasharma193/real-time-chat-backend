const nodemailer = require("nodemailer");
const dns = require("dns");

// FORCE IPV4
dns.setDefaultResultOrder("ipv4first");

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

  family: 4, // FORCE IPV4
});

const sendOTP = async (email, otp) => {

  try {

    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "OTP Verification",
      html: `
        <h2>Your OTP Code</h2>
        <h1>${otp}</h1>
        <p>Expires in 10 minutes.</p>
      `,
    });

    console.log("✅ Email sent:", info.response);

  } catch (err) {

    console.error("❌ Email send failed:", err);

    throw err;
  }
};

module.exports = { sendOTP };