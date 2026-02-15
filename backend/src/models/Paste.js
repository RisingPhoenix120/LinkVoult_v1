const mongoose = require("mongoose")

const FileSchema = new mongoose.Schema(
  {
    originalName: String,
    mimeType: String,
    size: Number,
    path: String,
    filename: String,
  },
  { _id: false }
)

const PasteSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ["text", "file"],
      required: true,
    },
    text: String,
    language: String,
    file: FileSchema,
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    ownerOnly: {
      type: Boolean,
      default: false,
    },
    passwordHash: String,
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    deleteKey: {
      type: String,
      required: true,
    },
    oneTime: {
      type: Boolean,
      default: false,
    },
    maxViews: Number,
    maxDownloads: Number,
    viewCount: {
      type: Number,
      default: 0,
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
    lastAccessedAt: Date,
    consumedAt: Date,
  },
  { timestamps: true }
)

module.exports = mongoose.model("Paste", PasteSchema)
