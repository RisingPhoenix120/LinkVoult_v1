import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Copy, Trash2 } from "lucide-react"
import api from "../lib/api"
import { formatDateTime } from "../lib/format"

export default function Dashboard() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get("/api/pastes")
      setItems(res.data.items || [])
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to load")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const remove = async (id: string) => {
    await api.delete(`/api/pastes/${id}`)
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const copy = async (value: string) => {
    await navigator.clipboard.writeText(value)
  }

  const getStatus = (item: any) => {
    const now = new Date()
    if (item.consumedAt) return "Consumed"
    if (item.expiresAt && new Date(item.expiresAt) <= now) return "Expired"
    return "Active"
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-16">
        <p className="text-slate-500">Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-16">
        <p className="rounded-xl bg-rose-50 p-4 text-rose-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-6 pb-20">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Your pastes</h1>
        <p className="text-sm text-slate-500">Manage links, see statuses, and delete.</p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white/70">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.2em] text-slate-500">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Expires</th>
              <th className="px-4 py-3">Views</th>
              <th className="px-4 py-3">Link</th>
              <th className="px-4 py-3">Delete Key</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-slate-100">
                <td className="px-4 py-3">
                  <Link to={`/p/${item.id}`} className="text-ink hover:underline">
                    {item.title || "Untitled"}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="max-w-[120px] truncate text-xs text-slate-600">
                      {item.id}
                    </span>
                    <button
                      type="button"
                      onClick={() => copy(item.id)}
                      className="rounded-full border border-slate-200 p-1 text-slate-600"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3 capitalize">{item.type}</td>
                <td className="px-4 py-3">{getStatus(item)}</td>
                <td className="px-4 py-3">{formatDateTime(item.expiresAt)}</td>
                <td className="px-4 py-3">
                  {item.type === "text" ? item.viewCount ?? 0 : item.downloadCount ?? 0}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="max-w-[160px] truncate text-xs text-slate-600">
                      {item.url}
                    </span>
                    <button
                      type="button"
                      onClick={() => copy(item.url)}
                      className="rounded-full border border-slate-200 p-1 text-slate-600"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="max-w-[140px] truncate text-xs text-slate-600">
                      {item.deleteKey}
                    </span>
                    <button
                      type="button"
                      onClick={() => copy(item.deleteKey)}
                      className="rounded-full border border-slate-200 p-1 text-slate-600"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => remove(item.id)}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600"
                  >
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
