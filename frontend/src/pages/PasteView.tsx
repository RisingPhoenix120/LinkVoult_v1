import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { Copy, Download, KeyRound } from "lucide-react"
import api from "../lib/api"
import { formatBytes, formatDateTime } from "../lib/format"

export default function PasteView() {
  const { slug } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [paste, setPaste] = useState<any>(null)
  const [password, setPassword] = useState("")
  const [needsPassword, setNeedsPassword] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const fetchPaste = async (providedPassword?: string) => {
    setLoading(true)
    setError(null)
    setPasswordError(null)
    try {
      const res = await api.get(`/api/pastes/${slug}`, {
        params: providedPassword ? { password: providedPassword } : undefined,
      })
      setPaste(res.data)
      setNeedsPassword(false)
    } catch (err: any) {
      const message = err?.response?.data?.error || "Failed to load"
      if (message.toLowerCase().includes("password")) {
        setNeedsPassword(true)
        setPasswordError(message)
      } else {
        setError(message)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (slug) {
      fetchPaste()
    }
  }, [slug])

  const copyText = async () => {
    if (paste?.text) {
      await navigator.clipboard.writeText(paste.text)
    }
  }

  const downloadFile = () => {
    if (!paste?.downloadUrl) return
    const url = new URL(paste.downloadUrl)
    if (password) {
      url.searchParams.set("password", password)
    }
    window.location.href = url.toString()
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <p className="text-slate-500">Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <p className="rounded-xl bg-rose-50 p-4 text-rose-600">{error}</p>
      </div>
    )
  }

  if (needsPassword) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16">
        <div className="rounded-3xl border border-slate-200 bg-white/70 p-6">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <KeyRound className="h-4 w-4 text-ember" />
            This link is password-protected
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="mt-4 w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2"
          />
          {passwordError && (
            <p className="mt-3 text-sm text-rose-600">{passwordError}</p>
          )}
          <button
            type="button"
            onClick={() => fetchPaste(password)}
            className="mt-4 w-full rounded-xl bg-ink px-4 py-2 text-sm text-white"
          >
            Unlock
          </button>
        </div>
      </div>
    )
  }

  if (!paste) return null

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-6 pb-20">
      <div className="rounded-3xl border border-slate-200 bg-white/70 p-6">
        <h1 className="text-2xl font-semibold text-ink">{paste.title || "Untitled"}</h1>
        <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
          <div>Created: {formatDateTime(paste.createdAt)}</div>
          <div>Expires: {formatDateTime(paste.expiresAt)}</div>
          {paste.type === "text" ? (
            <div>Views: {paste.viewCount ?? 0}</div>
          ) : (
            <div>Downloads: {paste.downloadCount ?? 0}</div>
          )}
          <div>One-time: {paste.oneTime ? "Yes" : "No"}</div>
        </div>
      </div>

      {paste.type === "text" ? (
        <div className="rounded-3xl border border-slate-200 bg-white/70 p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Language: {paste.language || "Plain"}</p>
            <button
              type="button"
              onClick={copyText}
              className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs"
            >
              <Copy className="h-3 w-3" /> Copy
            </button>
          </div>
          <pre className="mt-4 max-h-[500px] overflow-auto rounded-2xl bg-slate-900/95 p-4 text-sm text-slate-100">
            {paste.text}
          </pre>
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white/70 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-ink">{paste.file?.originalName}</p>
              <p className="text-xs text-slate-500">
                {formatBytes(paste.file?.size)} • {paste.file?.mimeType}
              </p>
            </div>
            <button
              type="button"
              onClick={downloadFile}
              className="flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-xs text-white"
            >
              <Download className="h-4 w-4" /> Download
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
