const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      console.log("❌ No Authorization header");
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      console.log("❌ Token missing after Bearer");
      return res.status(401).json({ error: "Invalid token format" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    console.log("✅ AUTH OK:", decoded);

    next();

  } catch (err) {
    console.error("🔥 AUTH ERROR:", err.message);
    return res.status(401).json({ error: "Invalid token" });
  }
};