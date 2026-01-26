const express = require("express");
const router = express.Router();

router.post("/", (req, res) => {
  const data = req.body;

  console.log("Received data:", data);

  res.json({
    success: true,
    received: data
  });
});

module.exports = router;
