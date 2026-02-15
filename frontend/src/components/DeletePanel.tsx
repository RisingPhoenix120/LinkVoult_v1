import { useState } from "react"
import { Trash2 } from "lucide-react"
import api from "../lib/api"

export default function DeletePanel() {
  const [slug, setSlug] = useState("")
  const [deleteKey, setDeleteKey] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    setError(null)
    setMessage(null)
    if (!slug || !deleteKey) {
      setError("Provide both link id and delete key.")
      return
    }
    try {
      await api.delete(`/api/pastes/${slug}`, { data: { deleteKey } })
      setMessage("Paste deleted.")
    } catch (err: any) {
      setError(err?.response?.data?.error || "Delete failed")
    }
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white/70 p-6">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Trash2 className="h-4 w-4 text-ember" />
        Manual delete
      </div>
      <p className="mt-2 text-xs text-slate-500">Use the delete key you received on creation.</p>
      <div className="mt-4 grid gap-3">
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="Paste ID (slug)"
          className="w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm"
        />
        <input
          value={deleteKey}
          onChange={(e) => setDeleteKey(e.target.value)}
          placeholder="Delete key"
          className="w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={handleDelete}
          className="rounded-xl bg-ink px-4 py-2 text-sm text-white"
        >
          Delete
        </button>
        {message && <p className="text-sm text-emerald-600">{message}</p>}
        {error && <p className="text-sm text-rose-600">{error}</p>}
      </div>
    </div>
  )
}
