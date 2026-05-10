const express = require("express");
const cors = require("cors");

const healthRoute = require("./routes/health");
const echoRoute = require("./routes/echo");
const authRoute = require("./routes/auth");

const app = express();

// CORS
const cors = require("cors");

app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://real-time-chat-rg6656wnb-adityasharma2289-2862s-projects.vercel.app/"
  ],
  credentials: true
}));

app.use(express.json());

// DEBUG LOGGER
app.use((req, res, next) => {
  console.log("🌐", req.method, req.url);
  next();
});

// ROUTES (ALL UNDER /api)
app.use("/api/health", healthRoute);
app.use("/api/echo", echoRoute);
app.use("/api/auth", authRoute);
app.use("/api/messages", require("./routes/messages"));
app.use("/api/rooms", require("./routes/rooms"));

module.exports = app;