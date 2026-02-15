import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await register(email, password, name)
      navigate("/dashboard")
    } catch (err: any) {
      setError(err?.response?.data?.error || "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white/70 p-6">
        <h1 className="text-2xl font-semibold text-ink">Create account</h1>
        <p className="mt-2 text-sm text-slate-500">Save pastes and manage them later.</p>

        <label className="mt-6 block text-xs uppercase tracking-[0.2em] text-slate-500">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2"
        />

        <label className="mt-4 block text-xs uppercase tracking-[0.2em] text-slate-500">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2"
          required
        />

        <label className="mt-4 block text-xs uppercase tracking-[0.2em] text-slate-500">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2"
          required
        />

        {error && <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-ink px-4 py-2 text-sm text-white"
        >
          {loading ? "Creating..." : "Create account"}
        </button>

        <p className="mt-4 text-sm text-slate-500">
          Already have an account? <Link to="/login" className="text-ink">Sign in</Link>
        </p>
      </form>
    </div>
  )
}
