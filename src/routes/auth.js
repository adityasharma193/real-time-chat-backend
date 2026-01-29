const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Temporary in-memory user store (later you will replace this with DB)
let users = [];

/*
POST /auth/register
Body:
{
  "name": "Aditya",
  "email": "aditya@gmail.com",
  "password": "123456"
}
*/console.log("AUTH ROUTES LOADED");

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ error: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = {
    id: users.length + 1,
    name,
    email,
    password: hashedPassword
  };

  users.push(newUser);

  res.status(201).json({
    success: true,
    message: "User registered successfully"
  });
});

/*
POST /auth/login
Body:
{
  "email": "aditya@gmail.com",
  "password": "123456"
}
*/
router.post("/login", async (req, res) => {
    console.log("LOGIN HIT:", req.body);

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(400).json({ error: "Invalid email or password" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ error: "Invalid email or password" });
  }

  // 🔥 JWT generation
  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
console.log("JWT TOKEN GENERATED:", token);

 return res.json({
  success: true,
  message: "Login successful",
  token: token,
  user: {
    id: user.id,
    name: user.name,
    email: user.email
  }
});

});

module.exports = router;
