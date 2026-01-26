const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send("Chat backend running");
});

module.exports = router;
