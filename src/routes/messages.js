const express = require("express");
const router = express.Router();
const { messages } = require("../data/messages");
const { rooms } = require("../data/rooms");
const authMiddleware = require("../authMiddleware");

console.log("MESSAGES ROUTES LOADED");
router.post("/:roomId/send", authMiddleware, (req, res) => {
  const roomId = parseInt(req.params.roomId);
  const { text } = req.body;
  const userId = req.user.userId;

  if (!text) {
    return res.status(400).json({ error: "Message text is required" });
  }

  const room = rooms.find(r => r.id === roomId);
  if (!room) {
    return res.status(404).json({ error: "Room not found" });
  }

  if (!room.users.includes(userId)) {
    return res.status(403).json({ error: "You are not a member of this room" });
  }

  const message = {
    id: messages.length + 1,
    roomId,
    userId,
    text,
    createdAt: new Date()
  };

  messages.push(message);

  res.status(201).json({
    success: true,
    message
  });
});
router.get("/:roomId", authMiddleware, (req, res) => {
  const roomId = parseInt(req.params.roomId);

  const room = rooms.find(r => r.id === roomId);
  if (!room) {
    return res.status(404).json({ error: "Room not found" });
  }

  const roomMessages = messages.filter(m => m.roomId === roomId);

  res.json({
    success: true,
    messages: roomMessages
  });
});

router.get("/:roomId", authMiddleware, (req, res) => {
  const roomId = parseInt(req.params.roomId);
  const userId = req.user.userId;

  const room = rooms.find(r => r.id === roomId);
  if (!room) {
    return res.status(404).json({ error: "Room not found" });
  }

  if (!room.users.includes(userId)) {
    return res.status(403).json({ error: "You are not a member of this room" });
  }

  const roomMessages = messages.filter(m => m.roomId === roomId);

  res.json({
    success: true,
    messages: roomMessages
  });
});
module.exports = router;