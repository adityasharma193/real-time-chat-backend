const express = require("express");
const healthRoute = require("./routes/health");
const echoRoute = require("./routes/echo");

const app = express();

app.use(express.json());

app.use("/health", healthRoute);
app.use("/echo", echoRoute);

module.exports = app;
