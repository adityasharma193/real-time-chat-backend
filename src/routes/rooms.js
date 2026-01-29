const express = require("express");
const router = express.Router();
const authMiddleware = require("../authMiddleware");
const { rooms } = require("../data/rooms");

/*
POST /rooms/create
*/
router.post("/create", authMiddleware, (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Room name is required" });
  }

  const room = {
    id: rooms.length + 1,
    name,
    createdBy: req.user.userId,
    users: [req.user.userId]
  };

  rooms.push(room);

  res.status(201).json({
    success: true,
    room
  });
});

/*
POST /rooms/:roomId/join
*/
router.post("/:roomId/join", authMiddleware, (req, res) => {
  const roomId = parseInt(req.params.roomId);
  const userId = req.user.userId;

  const room = rooms.find(r => r.id === roomId);
  if (!room) {
    return res.status(404).json({ error: "Room not found" });
  }

  if (room.users.includes(userId)) {
    return res.status(400).json({ error: "User already in this room" });
  }

  room.users.push(userId);

  res.json({
    success: true,
    message: "Joined room successfully",
    room
  });
});

/*
GET /rooms
*/
router.get("/", authMiddleware, (req, res) => {
  res.json({
    success: true,
    rooms
  });
});

module.exports = router;
