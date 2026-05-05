const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { sendOTP } = require("../utils/sendEmail");
// ================= REGISTER =================
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields required" });
    }

    const existing = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashed = await bcrypt.hash(password, 10);

    // ================= CASE 1: USER EXISTS =================
    if (existing.rows.length > 0) {
      const user = existing.rows[0];

      // ❌ already verified → block
      if (user.is_verified) {
        return res.status(400).json({ error: "Email already exists" });
      }

      // 🔥 update existing unverified user
      await pool.query(
        `UPDATE users 
         SET name=$1, password=$2, otp=$3, otp_expiry=NOW() + INTERVAL '10 minutes'
         WHERE email=$4`,
        [name, hashed, otp, email]
      );

    } else {
      // ================= CASE 2: NEW USER =================
      await pool.query(
        `INSERT INTO users (name, email, password, otp, otp_expiry, is_verified)
         VALUES ($1,$2,$3,$4, NOW() + INTERVAL '10 minutes', false)`,
        [name, email, hashed, otp]
      );
    }

    // 🔥 SEND EMAIL
    await sendOTP(email, otp);

    res.json({ message: "OTP sent to email" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Register failed" });
  }
});

// ================= VERIFY OTP =================
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const result = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "User not found" });
    }

    const user = result.rows[0];

    if (user.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    if (new Date() > user.otp_expiry) {
      return res.status(400).json({ error: "OTP expired" });
    }

    await pool.query(
      `UPDATE users 
       SET is_verified=true, otp=NULL, otp_expiry=NULL 
       WHERE email=$1`,
      [email]
    );

    res.json({ message: "Account verified" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "OTP verification failed" });
  }
});

// ================= RESEND OTP =================
router.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;

    const result = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "User not found" });
    }

    const user = result.rows[0];

    if (user.is_verified) {
      return res.status(400).json({ error: "Already verified" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await pool.query(
      `UPDATE users 
       SET otp=$1, otp_expiry=NOW() + INTERVAL '10 minutes'
       WHERE email=$2`,
      [otp, email]
    );

    await sendOTP(email, otp);

    res.json({ message: "OTP resent" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Resend failed" });
  }
});

// ================= LOGIN =================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const user = result.rows[0];

    if (!user.is_verified) {
      return res.status(403).json({
        error: "Please verify your email first"
      });
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

module.exports = router;