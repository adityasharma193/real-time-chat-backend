const express = require("express");
const healthRoute = require("./routes/health");

const app = express();

app.use(express.json());
app.use("/", healthRoute);

module.exports = app;
