const express = require("express");
const healthRoute = require("./routes/health");
const echoRoute = require("./routes/echo");
const usersRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const chatRoute = require("./routes/chat");
const roomsRoute = require("./routes/rooms");
const messagesRoute = require("./routes/messages");

const app = express();

app.use(express.json());

app.use("/health", healthRoute);
app.use("/echo", echoRoute);
app.use("/users", usersRoute);   // temporary
app.use("/auth", authRoute);     // THIS is what enables /auth/*
app.use("/chat", chatRoute);
app.use("/rooms", roomsRoute);
app.use("/messages", messagesRoute);
module.exports = app;
console.log("JWT SECRET:", process.env.JWT_SECRET);
