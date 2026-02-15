const express = require("express")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const User = require("../models/User")
const { config } = require("../config")
const { requireAuth } = require("../middleware/auth")

const router = express.Router()

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function createToken(user) {
  return jwt.sign({ sub: user._id.toString(), email: user.email }, config.jwtSecret, {
    expiresIn: config.tokenExpiresIn,
  })
}

router.post("/register", async (req, res) => {
  const { email, password, name } = req.body || {}
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" })
  }
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" })
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters" })
  }

  const existing = await User.findOne({ email: email.toLowerCase() })
  if (existing) {
    return res.status(409).json({ error: "Email already in use" })
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await User.create({
    email: email.toLowerCase(),
    name: name?.trim() || "",
    passwordHash,
  })

  const token = createToken(user)
  return res.status(201).json({
    token,
    user: { id: user._id, email: user.email, name: user.name },
  })
})

router.post("/login", async (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" })
  }

  const user = await User.findOne({ email: email.toLowerCase() })
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" })
  }

  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) {
    return res.status(401).json({ error: "Invalid credentials" })
  }

  const token = createToken(user)
  return res.json({
    token,
    user: { id: user._id, email: user.email, name: user.name },
  })
})

router.get("/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.user.id)
  if (!user) {
    return res.status(404).json({ error: "User not found" })
  }
  return res.json({ id: user._id, email: user.email, name: user.name })
})

module.exports = router
