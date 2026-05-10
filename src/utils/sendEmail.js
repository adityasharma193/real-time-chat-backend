const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendOTP = async (email, otp) => {

  try {

    const response = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "OTP Verification",
      html: `
        <h2>Your OTP Code</h2>
        <h1>${otp}</h1>
        <p>Expires in 10 minutes.</p>
      `,
    });

    console.log("✅ Email sent:", response);

  } catch (err) {

    console.error("❌ Resend error:", err);

    throw err;
  }
};

module.exports = { sendOTP };