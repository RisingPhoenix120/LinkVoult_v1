require("dotenv").config()

const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const morgan = require("morgan")

const { config, assertRequired } = require("./config")
const { connectDb } = require("./db")
const { ensureUploadDir } = require("./middleware/upload")
const authRoutes = require("./routes/auth")
const pasteRoutes = require("./routes/pastes")
const { startCleanupJob } = require("./services/cleanup")

const app = express()

app.set("trust proxy", 1)
app.use(helmet())
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  })
)
app.use(express.json({ limit: "1mb" }))
app.use(express.urlencoded({ extended: true }))
app.use(morgan("dev"))

app.get("/", (_req, res) => {
  res.json({ status: "ok", name: "LinkVault API" })
})

app.use("/api/auth", authRoutes)
app.use("/api/pastes", pasteRoutes)

app.use((req, res) => {
  res.status(404).json({ error: "Not found" })
})

app.use((err, _req, res, _next) => {
  if (err?.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ error: `File exceeds ${config.maxFileSizeMb}MB limit` })
  }
  if (err?.message === "Unsupported file type") {
    return res.status(400).json({ error: err.message })
  }
  return res.status(500).json({ error: "Server error" })
})

async function start() {
  try {
    assertRequired()
    ensureUploadDir()
    await connectDb(config.mongoUri)
    startCleanupJob()
    app.listen(config.port, () => {
      console.log(`LinkVault API running on port ${config.port}`)
    })
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

start()
