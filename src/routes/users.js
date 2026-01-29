const express = require("express");
const router = express.Router();
const authMiddleware = require("../authMiddleware");
const { users } = require("../data/store");

router.get("/", authMiddleware, (req, res) => {
  res.json({
    success: true,
    users
  });
});

module.exports = router;
