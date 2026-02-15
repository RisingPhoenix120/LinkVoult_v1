const express = require("express")
const bcrypt = require("bcryptjs")
const fs = require("fs/promises")
const Paste = require("../models/Paste")
const { config } = require("../config")
const { createSlug, createDeleteKey } = require("../utils/ids")
const { toBoolean, toNumber } = require("../utils/parse")
const { upload } = require("../middleware/upload")
const { authenticate, requireAuth } = require("../middleware/auth")
const { createPasteLimiter, readPasteLimiter } = require("../middleware/rateLimits")

const router = express.Router()

function getPasswordFromRequest(req) {
  return (
    req.query.password ||
    req.headers["x-paste-password"] ||
    req.body?.password ||
    ""
  )
}

function getDeleteKeyFromRequest(req) {
  return (
    req.query.deleteKey ||
    req.headers["x-delete-key"] ||
    req.body?.deleteKey ||
    ""
  )
}

function resolveExpiry({ expiresAt, expiresInMinutes }) {
  if (expiresAt) {
    const date = new Date(expiresAt)
    return Number.isNaN(date.getTime()) ? null : date
  }
  if (expiresInMinutes !== undefined) {
    const minutes = Number(expiresInMinutes)
    if (!Number.isFinite(minutes) || minutes <= 0) return null
    return new Date(Date.now() + minutes * 60 * 1000)
  }
  return new Date(Date.now() + config.defaultExpiryMinutes * 60 * 1000)
}

function isUnavailable(paste) {
  const now = new Date()
  if (paste.expiresAt && paste.expiresAt <= now) return true
  if (paste.consumedAt) return true
  if (paste.type === "text" && paste.maxViews && paste.viewCount >= paste.maxViews) return true
  if (paste.type === "file" && paste.maxDownloads && paste.downloadCount >= paste.maxDownloads)
    return true
  return false
}

async function verifyPassword(paste, provided) {
  if (!paste.passwordHash) return true
  if (!provided) return false
  return bcrypt.compare(provided, paste.passwordHash)
}

router.get("/", authenticate, requireAuth, async (req, res) => {
  const pastes = await Paste.find({ owner: req.user.id })
    .sort({ createdAt: -1 })
    .limit(200)
    .lean()

  const results = pastes.map((paste) => ({
    id: paste.slug,
    title: paste.title,
    type: paste.type,
    createdAt: paste.createdAt,
    expiresAt: paste.expiresAt,
    ownerOnly: paste.ownerOnly,
    oneTime: paste.oneTime,
    maxViews: paste.maxViews,
    maxDownloads: paste.maxDownloads,
    viewCount: paste.viewCount,
    downloadCount: paste.downloadCount,
    consumedAt: paste.consumedAt,
    requiresPassword: Boolean(paste.passwordHash),
    url: `${config.appBaseUrl}/p/${paste.slug}`,
    deleteKey: paste.deleteKey,
  }))

  return res.json({ items: results })
})

router.post(
  "/",
  authenticate,
  createPasteLimiter,
  (req, _res, next) => {
    req.pasteId = createSlug()
    req.deleteKey = createDeleteKey()
    next()
  },
  upload.single("file"),
  async (req, res, next) => {
    try {
      const {
        title,
        text,
        language,
        password,
        expiresAt,
        expiresInMinutes,
        oneTime,
        maxViews,
        maxDownloads,
        ownerOnly,
      } = req.body || {}

      const hasText = typeof text === "string" && text.trim().length > 0
      const hasFile = Boolean(req.file)

      if (hasText === hasFile) {
        return res
          .status(400)
          .json({ error: "Provide either text or a file, but not both" })
      }

      if (hasText && text.length > config.maxTextLength) {
        return res.status(400).json({
          error: `Text exceeds maximum length of ${config.maxTextLength} characters`,
        })
      }

      const expiry = resolveExpiry({ expiresAt, expiresInMinutes })
      if (!expiry) {
        return res.status(400).json({ error: "Invalid expiration" })
      }
      if (expiry <= new Date()) {
        return res.status(400).json({ error: "Expiration must be in the future" })
      }

      const wantsOwnerOnly = toBoolean(ownerOnly)
      if (wantsOwnerOnly && !req.user) {
        return res.status(401).json({ error: "Login required for owner-only pastes" })
      }

      const parsedMaxViews = toNumber(maxViews)
      const parsedMaxDownloads = toNumber(maxDownloads)

      if (parsedMaxViews !== undefined && parsedMaxViews < 1) {
        return res.status(400).json({ error: "Max views must be at least 1" })
      }
      if (parsedMaxDownloads !== undefined && parsedMaxDownloads < 1) {
        return res.status(400).json({ error: "Max downloads must be at least 1" })
      }

      const pasteData = {
        slug: req.pasteId,
        deleteKey: req.deleteKey,
        title: title?.trim() || "",
        type: hasText ? "text" : "file",
        text: hasText ? text : undefined,
        language: language?.trim() || "",
        owner: req.user ? req.user.id : undefined,
        ownerOnly: wantsOwnerOnly,
        expiresAt: expiry,
        oneTime: toBoolean(oneTime),
        maxViews: parsedMaxViews,
        maxDownloads: parsedMaxDownloads,
      }

      if (pasteData.oneTime) {
        if (pasteData.type === "text") {
          pasteData.maxViews = 1
        } else {
          pasteData.maxDownloads = 1
        }
      }

      if (password) {
        pasteData.passwordHash = await bcrypt.hash(password, 10)
      }

      if (hasFile && req.file) {
        pasteData.file = {
          originalName: req.file.originalname,
          mimeType: req.file.mimetype,
          size: req.file.size,
          path: req.file.path,
          filename: req.file.filename,
        }
      }

      const paste = await Paste.create(pasteData)

      return res.status(201).json({
        id: paste.slug,
        url: `${config.appBaseUrl}/p/${paste.slug}`,
        deleteKey: paste.deleteKey,
        deleteUrl: `${config.appBaseUrl}/p/${paste.slug}?deleteKey=${paste.deleteKey}`,
        expiresAt: paste.expiresAt,
        oneTime: paste.oneTime,
        maxViews: paste.maxViews,
        maxDownloads: paste.maxDownloads,
        ownerOnly: paste.ownerOnly,
        requiresPassword: Boolean(paste.passwordHash),
      })
    } catch (err) {
      return next(err)
    }
  }
)

router.get("/:slug", authenticate, readPasteLimiter, async (req, res) => {
  const paste = await Paste.findOne({ slug: req.params.slug })
  if (!paste) {
    return res.status(403).json({ error: "Invalid or expired link" })
  }

  if (paste.ownerOnly) {
    if (!req.user || paste.owner?.toString() !== req.user.id) {
      return res.status(403).json({ error: "Access denied" })
    }
  }

  const ok = await verifyPassword(paste, getPasswordFromRequest(req))
  if (!ok) {
    return res.status(403).json({ error: "Invalid password" })
  }

  if (isUnavailable(paste)) {
    return res.status(403).json({ error: "Invalid or expired link" })
  }

  paste.lastAccessedAt = new Date()

  if (paste.type === "text") {
    paste.viewCount += 1
    if (paste.maxViews && paste.viewCount >= paste.maxViews) {
      paste.consumedAt = new Date()
    }
    await paste.save()

    return res.json({
      id: paste.slug,
      type: paste.type,
      title: paste.title,
      text: paste.text,
      language: paste.language,
      createdAt: paste.createdAt,
      expiresAt: paste.expiresAt,
      oneTime: paste.oneTime,
      maxViews: paste.maxViews,
      viewCount: paste.viewCount,
      ownerOnly: paste.ownerOnly,
      requiresPassword: Boolean(paste.passwordHash),
    })
  }

  await paste.save()

  return res.json({
    id: paste.slug,
    type: paste.type,
    title: paste.title,
    file: {
      originalName: paste.file?.originalName,
      mimeType: paste.file?.mimeType,
      size: paste.file?.size,
    },
    createdAt: paste.createdAt,
    expiresAt: paste.expiresAt,
    oneTime: paste.oneTime,
    maxDownloads: paste.maxDownloads,
    downloadCount: paste.downloadCount,
    ownerOnly: paste.ownerOnly,
    requiresPassword: Boolean(paste.passwordHash),
    downloadUrl: `${config.apiBaseUrl}/api/pastes/${paste.slug}/download`,
  })
})

router.get("/:slug/download", authenticate, readPasteLimiter, async (req, res) => {
  const paste = await Paste.findOne({ slug: req.params.slug })
  if (!paste) {
    return res.status(403).json({ error: "Invalid or expired link" })
  }
  if (paste.type !== "file") {
    return res.status(400).json({ error: "Paste is not a file" })
  }

  if (paste.ownerOnly) {
    if (!req.user || paste.owner?.toString() !== req.user.id) {
      return res.status(403).json({ error: "Access denied" })
    }
  }

  const ok = await verifyPassword(paste, getPasswordFromRequest(req))
  if (!ok) {
    return res.status(403).json({ error: "Invalid password" })
  }

  if (isUnavailable(paste)) {
    return res.status(403).json({ error: "Invalid or expired link" })
  }

  paste.downloadCount += 1
  paste.lastAccessedAt = new Date()
  if (paste.maxDownloads && paste.downloadCount >= paste.maxDownloads) {
    paste.consumedAt = new Date()
  }
  await paste.save()

  return res.download(paste.file.path, paste.file.originalName)
})

async function handleDelete(req, res) {
  const paste = await Paste.findOne({ slug: req.params.slug })
  if (!paste) {
    return res.status(403).json({ error: "Invalid or expired link" })
  }

  const deleteKey = getDeleteKeyFromRequest(req)
  const isOwner = req.user && paste.owner?.toString() === req.user.id

  if (!isOwner && deleteKey !== paste.deleteKey) {
    return res.status(403).json({ error: "Invalid delete key" })
  }

  if (paste.file?.path) {
    try {
      await fs.unlink(paste.file.path)
    } catch (_err) {
      // ignore
    }
  }

  await Paste.deleteOne({ _id: paste._id })
  return res.json({ ok: true })
}

router.delete("/:slug", authenticate, handleDelete)

router.post("/:slug/delete", authenticate, async (req, res) => {
  return handleDelete(req, res)
})

module.exports = router
