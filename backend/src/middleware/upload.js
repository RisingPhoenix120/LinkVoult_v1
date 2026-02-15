const path = require("path")
const fs = require("fs")
const multer = require("multer")
const { config } = require("../config")
const { createSlug } = require("../utils/ids")

function ensureUploadDir() {
  if (!fs.existsSync(config.uploadDir)) {
    fs.mkdirSync(config.uploadDir, { recursive: true })
  }
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    ensureUploadDir()
    cb(null, config.uploadDir)
  },
  filename: (req, file, cb) => {
    if (!req.pasteId) {
      req.pasteId = createSlug()
    }
    const ext = path.extname(file.originalname).slice(0, 10)
    cb(null, `${req.pasteId}${ext}`)
  },
})

function fileFilter(_req, file, cb) {
  if (config.allowedMimeTypes.length === 0) {
    return cb(null, true)
  }
  if (config.allowedMimeTypes.includes(file.mimetype)) {
    return cb(null, true)
  }
  return cb(new Error("Unsupported file type"))
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.maxFileSizeMb * 1024 * 1024,
  },
})

module.exports = {
  upload,
  ensureUploadDir,
}
