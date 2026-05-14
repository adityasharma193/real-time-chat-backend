const passport = require("passport");

const GoogleStrategy =
  require("passport-google-oauth20").Strategy;

const pool = require("./db");

// ================= GOOGLE STRATEGY =================
passport.use(
  new GoogleStrategy(
    {
      clientID:
        process.env.GOOGLE_CLIENT_ID,

      clientSecret:
        process.env.GOOGLE_CLIENT_SECRET,

      callbackURL:
        process.env.GOOGLE_CALLBACK_URL,
    },

    async (
      accessToken,
      refreshToken,
      profile,
      done
    ) => {

      try {

        const email =
          profile.emails[0].value;

        const name =
          profile.displayName;

        // ================= CHECK USER =================
        let user = await pool.query(
          `
          SELECT *
          FROM users
          WHERE email = $1
          `,
          [email]
        );

        // ================= CREATE USER =================
        if (user.rows.length === 0) {

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
              '',
              true
            )
            `,
            [name, email]
          );

          // fetch created user
          user = await pool.query(
            `
            SELECT *
            FROM users
            WHERE email = $1
            `,
            [email]
          );
        }

        // ================= SUCCESS =================
        return done(
          null,
          user.rows[0]
        );

      } catch (err) {

        console.error(
          "GOOGLE AUTH ERROR:",
          err
        );

        return done(err, null);
      }
    }
  )
);

module.exports = passport;