const express = require("express");
const cors = require("cors");

const healthRoute = require("./routes/health");
const echoRoute = require("./routes/echo");
const authRoute = require("./routes/auth");

const app = express();

// ================= CORS =================
app.use(cors({

  origin: function (origin, callback) {

    // allow requests without origin
    if (!origin) {
      return callback(null, true);
    }

    // localhost
    if (origin === "http://localhost:3000") {
      return callback(null, true);
    }

    // allow ALL vercel deployments
    if (origin.includes("vercel.app")) {
      return callback(null, true);
    }

    return callback(
      new Error("Not allowed by CORS")
    );
  },

  methods: ["GET", "POST", "PUT", "DELETE"],

  credentials: true
}));

// ================= BODY PARSER =================
app.use(express.json());

// ================= DEBUG LOGGER =================
app.use((req, res, next) => {

  console.log("🌐", req.method, req.url);

  next();
});

// ================= ROUTES =================
app.use("/api/health", healthRoute);

app.use("/api/echo", echoRoute);

app.use("/api/auth", authRoute);

app.use(
  "/api/messages",
  require("./routes/messages")
);

app.use(
  "/api/rooms",
  require("./routes/rooms")
);

// ================= EXPORT =================
module.exports = app;