const fs = require("fs/promises")
const Paste = require("../models/Paste")
const { config } = require("../config")

async function deletePasteFiles(paste) {
  if (paste.file && paste.file.path) {
    try {
      await fs.unlink(paste.file.path)
    } catch (_err) {
      // ignore missing files
    }
  }
}

async function runCleanup() {
  const now = new Date()
  const expired = await Paste.find({
    $or: [{ expiresAt: { $lte: now } }, { consumedAt: { $ne: null } }],
  })
  if (expired.length === 0) return

  for (const paste of expired) {
    await deletePasteFiles(paste)
    await Paste.deleteOne({ _id: paste._id })
  }
}

function startCleanupJob() {
  setInterval(() => {
    runCleanup().catch(() => {})
  }, config.cleanupIntervalMs)
  runCleanup().catch(() => {})
}

module.exports = {
  startCleanupJob,
}
