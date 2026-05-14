const express = require("express");

const cors = require("cors");

const passport =
  require("./config/passport");

const healthRoute =
  require("./routes/health");

const authRoute =
  require("./routes/auth");

const app = express();

// ================= CORS =================
app.use(
  cors({

    origin: function (
      origin,
      callback
    ) {

      // allow mobile apps/postman/server requests
      if (!origin) {
        return callback(
          null,
          true
        );
      }

      // localhost
      if (
        origin ===
        "http://localhost:3000"
      ) {

        return callback(
          null,
          true
        );
      }

      // allow all vercel deployments
      if (
        origin.endsWith(
          ".vercel.app"
        )
      ) {

        return callback(
          null,
          true
        );
      }

      return callback(
        new Error(
          "Not allowed by CORS"
        )
      );
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "DELETE",
    ],
  })
);

// ================= BODY PARSER =================
app.use(express.json());

// ================= PASSPORT =================
app.use(
  passport.initialize()
);

// ================= DEBUG LOGGER =================
app.use(
  (req, res, next) => {

    console.log(
      "🌐",
      req.method,
      req.url
    );

    next();
  }
);

// ================= ROUTES =================
app.use(
  "/api/health",
  healthRoute
);

app.use(
  "/api/auth",
  authRoute
);

app.use(
  "/api/messages",
  require("./routes/messages")
);

app.use(
  "/api/rooms",
  require("./routes/rooms")
);

// ================= ROOT =================
app.get("/", (req, res) => {

  res.send(
    "Real Time Chat Backend Running"
  );
});

// ================= EXPORT =================
module.exports = app;