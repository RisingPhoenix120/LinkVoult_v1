const rateLimit = require("express-rate-limit")

const createPasteLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
})

const readPasteLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
})

module.exports = {
  createPasteLimiter,
  readPasteLimiter,
}
