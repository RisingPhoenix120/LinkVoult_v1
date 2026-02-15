const path = require("path")

function requireEnv(name) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required env: ${name}`)
  }
  return value
}

function toNumber(value, fallback) {
  const num = Number(value)
  return Number.isFinite(num) ? num : fallback
}

const config = {
  env: process.env.NODE_ENV || "development",
  port: toNumber(process.env.PORT, 4000),
  mongoUri: process.env.MONGODB_URI || "",
  jwtSecret: process.env.JWT_SECRET || "",
  tokenExpiresIn: process.env.TOKEN_EXPIRES_IN || "7d",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
  appBaseUrl: process.env.APP_BASE_URL || "http://localhost:5173",
  apiBaseUrl: process.env.API_BASE_URL || "http://localhost:4000",
  uploadDir: process.env.UPLOAD_DIR || path.join(__dirname, "..", "uploads"),
  maxFileSizeMb: toNumber(process.env.MAX_FILE_SIZE_MB, 10),
  maxTextLength: toNumber(process.env.MAX_TEXT_LENGTH, 100000),
  defaultExpiryMinutes: toNumber(process.env.DEFAULT_EXPIRY_MINUTES, 10),
  cleanupIntervalMs: toNumber(process.env.CLEANUP_INTERVAL_MS, 60000),
  allowedMimeTypes: (process.env.ALLOWED_MIME_TYPES || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean),
}

function assertRequired() {
  requireEnv("MONGODB_URI")
  requireEnv("JWT_SECRET")
}

module.exports = {
  config,
  assertRequired,
}
