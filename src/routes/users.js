const express = require("express");
const router = express.Router();

// In-memory storage
const users = [];
let nextId = 1;

// Create user
router.post("/", (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({
      success: false,
      message: "Name and email are required"
    });
  }

  const newUser = {
    id: nextId++,
    name,
    email
  };

  users.push(newUser);

  res.status(201).json({
    success: true,
    user: newUser
  });
});

// Get all users
router.get("/", (req, res) => {
  res.json({
    success: true,
    users
  });
});

// Get user by id
router.get("/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const user = users.find(u => u.id === id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found"
    });
  }

  res.json({
    success: true,
    user
  });
});

module.exports = router;
