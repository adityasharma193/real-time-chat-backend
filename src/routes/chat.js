const express = require("express");
const authMiddleware = require("../authMiddleware");
const { rooms } = require("../data/store");

const router = express.Router();

router.post("/room", authMiddleware, (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Room name is required" });
  }

  const newRoom = {
    id: rooms.length + 1,
    name,
    createdBy: req.user.userId
  };

  rooms.push(newRoom);

  res.status(201).json({
    success: true,
    room: newRoom
  });
});

module.exports = router;
