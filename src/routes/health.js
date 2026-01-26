const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Chat backend running",
    time: new Date().toISOString()
  });
});

module.exports = router;
