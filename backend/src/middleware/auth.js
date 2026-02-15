const jwt = require("jsonwebtoken")
const { config } = require("../config")

function authenticate(req, _res, next) {
  const authHeader = req.headers.authorization || ""
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null
  if (!token) {
    req.user = null
    return next()
  }
  try {
    const payload = jwt.verify(token, config.jwtSecret)
    req.user = { id: payload.sub, email: payload.email }
  } catch (err) {
    req.user = null
  }
  return next()
}

function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" })
  }
  return next()
}

module.exports = {
  authenticate,
  requireAuth,
}
