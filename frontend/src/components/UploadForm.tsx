import { useMemo, useState } from "react"
import { Copy, FileText, Link2, Lock, Shield, Timer, Trash2, Upload } from "lucide-react"
import api from "../lib/api"
import { useAuth } from "../context/AuthContext"
import { cn } from "../lib/utils"

const expiryOptions = [
  { label: "10 minutes (default)", value: "10" },
  { label: "1 hour", value: "60" },
  { label: "1 day", value: "1440" },
  { label: "7 days", value: "10080" },
  { label: "Custom date/time", value: "custom" },
]

export default function UploadForm() {
  const { user } = useAuth()
  const maxFileSizeMb = Number(import.meta.env.VITE_MAX_FILE_SIZE_MB || 10)

  const [mode, setMode] = useState<"text" | "file">("text")
  const [title, setTitle] = useState("")
  const [text, setText] = useState("")
  const [language, setLanguage] = useState("plaintext")
  const [file, setFile] = useState<File | null>(null)

  const [expiry, setExpiry] = useState("10")
  const [customExpiry, setCustomExpiry] = useState("")
  const [password, setPassword] = useState("")
  const [oneTime, setOneTime] = useState(false)
  const [maxViews, setMaxViews] = useState("")
  const [maxDownloads, setMaxDownloads] = useState("")
  const [ownerOnly, setOwnerOnly] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)

  const canSubmit = useMemo(() => {
    if (mode === "text") return text.trim().length > 0
    return Boolean(file)
  }, [mode, text, file])

  const copy = async (value: string) => {
    await navigator.clipboard.writeText(value)
  }

  const reset = () => {
    setText("")
    setFile(null)
    setTitle("")
    setPassword("")
    setOneTime(false)
    setMaxViews("")
    setMaxDownloads("")
    setOwnerOnly(false)
    setResult(null)
  }

  const handleSubmit = async () => {
    setError(null)
    if (!canSubmit) {
      setError("Please provide text or a file.")
      return
    }
    if (mode === "file" && file && file.size > maxFileSizeMb * 1024 * 1024) {
      setError(`File exceeds ${maxFileSizeMb}MB limit.`)
      return
    }
    if (expiry === "custom" && !customExpiry) {
      setError("Choose a custom expiration time.")
      return
    }

    const formData = new FormData()
    formData.append("title", title)
    formData.append("language", language)
    formData.append("oneTime", String(oneTime))

    if (ownerOnly) {
      formData.append("ownerOnly", "true")
    }

    if (password.trim()) {
      formData.append("password", password)
    }

    if (expiry === "custom") {
      formData.append("expiresAt", new Date(customExpiry).toISOString())
    } else if (expiry) {
      formData.append("expiresInMinutes", expiry)
    }

    if (mode === "text") {
      formData.append("text", text)
      if (maxViews) formData.append("maxViews", maxViews)
    } else if (file) {
      formData.append("file", file)
      if (maxDownloads) formData.append("maxDownloads", maxDownloads)
    }

    setLoading(true)
    try {
      const res = await api.post("/api/pastes", formData)
      setResult(res.data)
    } catch (err: any) {
      setError(err?.response?.data?.error || "Upload failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="gradient-border p-6 sm:p-8">
      <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMode("text")}
              className={cn(
                "flex items-center gap-2 rounded-full border px-4 py-2 text-sm",
                mode === "text" ? "border-ink bg-ink text-white" : "border-slate-200"
              )}
            >
              <FileText className="h-4 w-4" />
              Text
            </button>
            <button
              type="button"
              onClick={() => setMode("file")}
              className={cn(
                "flex items-center gap-2 rounded-full border px-4 py-2 text-sm",
                mode === "file" ? "border-ink bg-ink text-white" : "border-slate-200"
              )}
            >
              <Upload className="h-4 w-4" />
              File
            </button>
          </div>

          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-500">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Optional title"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/70 px-4 py-3"
            />
          </div>

          {mode === "text" ? (
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs uppercase tracking-[0.2em] text-slate-500">Paste</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs"
                >
                  <option value="plaintext">Plain text</option>
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="python">Python</option>
                  <option value="json">JSON</option>
                  <option value="bash">Shell</option>
                </select>
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={12}
                placeholder="Paste or type anything."
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/70 px-4 py-4 font-mono text-sm"
              />
            </div>
          ) : (
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-slate-500">File</label>
              <div className="mt-2 flex items-center justify-between rounded-2xl border border-dashed border-slate-300 bg-white/70 p-4">
                <div>
                  <p className="text-sm text-slate-700">
                    {file ? file.name : "Choose a file to upload"}
                  </p>
                  <p className="text-xs text-slate-500">Max size {maxFileSizeMb}MB</p>
                </div>
                <label className="cursor-pointer rounded-full bg-ink px-4 py-2 text-xs text-white">
                  Browse
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="glass rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Timer className="h-4 w-4 text-ocean" />
              Expiration
            </div>
            <select
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              className="mt-3 w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm"
            >
              {expiryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {expiry === "custom" && (
              <input
                type="datetime-local"
                value={customExpiry}
                onChange={(e) => setCustomExpiry(e.target.value)}
                className="mt-3 w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm"
              />
            )}
          </div>

          <div className="glass rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Lock className="h-4 w-4 text-ember" />
              Password
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Optional"
              className="mt-3 w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowAdvanced((prev) => !prev)}
            className="w-full rounded-2xl border border-slate-200 bg-white/70 px-3 py-2 text-sm text-slate-600"
          >
            {showAdvanced ? "Hide advanced options" : "Show advanced options"}
          </button>

          {showAdvanced && (
            <div className="glass rounded-2xl border border-slate-200 p-4 space-y-3">
              <label className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-mint" />
                  One-time view
                </span>
                <input
                  type="checkbox"
                  checked={oneTime}
                  onChange={(e) => setOneTime(e.target.checked)}
                />
              </label>

              {mode === "text" ? (
                <div>
                  <label className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Max views
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={maxViews}
                    onChange={(e) => setMaxViews(e.target.value)}
                    placeholder="Unlimited"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm"
                  />
                </div>
              ) : (
                <div>
                  <label className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Max downloads
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={maxDownloads}
                    onChange={(e) => setMaxDownloads(e.target.value)}
                    placeholder="Unlimited"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm"
                  />
                </div>
              )}

              {user ? (
                <label className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-ink" />
                    Owner-only access
                  </span>
                  <input
                    type="checkbox"
                    checked={ownerOnly}
                    onChange={(e) => setOwnerOnly(e.target.checked)}
                  />
                </label>
              ) : (
                <p className="text-xs text-slate-500">Sign in to enable owner-only access.</p>
              )}
            </div>
          )}

          {error && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-600">{error}</p>}

          {result ? (
            <div className="glass rounded-2xl border border-slate-200 p-4 space-y-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Share link</p>
                <div className="mt-2 flex items-center justify-between rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm">
                  <span className="truncate">{result.url}</span>
                  <button type="button" onClick={() => copy(result.url)}>
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Paste ID</p>
                <div className="mt-2 flex items-center justify-between rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm">
                  <span className="truncate">{result.id}</span>
                  <button type="button" onClick={() => copy(result.id)}>
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Delete key</p>
                <div className="mt-2 flex items-center justify-between rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm">
                  <span className="truncate">{result.deleteKey}</span>
                  <button type="button" onClick={() => copy(result.deleteKey)}>
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={reset}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm"
              >
                <Trash2 className="h-4 w-4" />
                Create another
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={handleSubmit}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm text-white",
                loading ? "bg-slate-400" : "bg-ink hover:bg-slate-900"
              )}
            >
              <Link2 className="h-4 w-4" />
              {loading ? "Creating..." : "Create share link"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
