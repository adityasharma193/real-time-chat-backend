const express = require("express");

const router = express.Router();

const pool = require("../config/db");

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

const passport = require("passport");

// ================= REGISTER =================
router.post(
  "/register",

  async (req, res) => {

    try {

      const {
        name,
        email,
        password,
      } = req.body;

      // ================= VALIDATION =================
      if (
        !name ||
        !email ||
        !password
      ) {

        return res.status(400).json({
          error: "All fields required",
        });
      }

      // ================= CHECK EXISTING USER =================
      const existing =
        await pool.query(
          `
          SELECT *
          FROM users
          WHERE email = $1
          `,
          [email]
        );

      if (
        existing.rows.length > 0
      ) {

        return res.status(400).json({
          error:
            "Email already exists",
        });
      }

      // ================= HASH PASSWORD =================
      const hashed =
        await bcrypt.hash(
          password,
          10
        );

      // ================= CREATE USER =================
      const result =
        await pool.query(
          `
          INSERT INTO users
          (
            name,
            email,
            password,
            is_verified
          )

          VALUES
          (
            $1,
            $2,
            $3,
            true
          )

          RETURNING *
          `,
          [
            name,
            email,
            hashed,
          ]
        );

      const user =
        result.rows[0];

      // ================= AUTO JOIN DEFAULT ROOM =================
      await pool.query(
        `
        INSERT INTO room_members
        (
          room_id,
          user_id,
          last_read_at
        )

        VALUES
        (
          1,
          $1,
          NOW()
        )
        `,
        [user.id]
      );

      // ================= JWT =================
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
        },

        process.env.JWT_SECRET,

        {
          expiresIn: "7d",
        }
      );

      // ================= RESPONSE =================
      res.json({
        success: true,
        token,

        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });

    } catch (err) {

      console.error(
        "REGISTER ERROR:",
        err
      );

      res.status(500).json({
        error:
          "Register failed",
      });
    }
  }
);

// ================= LOGIN =================
router.post(
  "/login",

  async (req, res) => {

    try {

      const {
        email,
        password,
      } = req.body;

      // ================= FIND USER =================
      const result =
        await pool.query(
          `
          SELECT *
          FROM users
          WHERE email = $1
          `,
          [email]
        );

      if (
        result.rows.length === 0
      ) {

        return res.status(400).json({
          error:
            "Invalid credentials",
        });
      }

      const user =
        result.rows[0];

      // ================= PASSWORD CHECK =================
      const valid =
        await bcrypt.compare(
          password,
          user.password
        );

      if (!valid) {

        return res.status(400).json({
          error:
            "Invalid credentials",
        });
      }

      // ================= JWT =================
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
        },

        process.env.JWT_SECRET,

        {
          expiresIn: "7d",
        }
      );

      // ================= RESPONSE =================
      res.json({
        success: true,
        token,

        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });

    } catch (err) {

      console.error(
        "LOGIN ERROR:",
        err
      );

      res.status(500).json({
        error:
          "Login failed",
      });
    }
  }
);

// ================= GOOGLE LOGIN =================
router.get(
  "/google",

  passport.authenticate(
    "google",
    {
      scope: [
        "profile",
        "email",
      ],
    }
  )
);

// ================= GOOGLE CALLBACK =================
router.get(
  "/google/callback",

  passport.authenticate(
    "google",
    {
      session: false,

      failureRedirect:
        process.env.CLIENT_URL,
    }
  ),

  async (req, res) => {

    try {

      const user =
        req.user;

      // ================= JWT =================
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
        },

        process.env.JWT_SECRET,

        {
          expiresIn: "7d",
        }
      );

      // ================= REDIRECT =================
      res.redirect(
        `${process.env.CLIENT_URL}/oauth-success?token=${token}`
      );

    } catch (err) {

      console.error(
        "GOOGLE CALLBACK ERROR:",
        err
      );

      res.redirect(
        process.env.CLIENT_URL
      );
    }
  }
);

module.exports = router;