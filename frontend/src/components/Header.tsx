import { Link } from "react-router-dom"
import { LogOut, ShieldCheck } from "lucide-react"
import { useAuth } from "../context/AuthContext"

export default function Header() {
  const { user, logout } = useAuth()

  return (
    <header className="px-6 py-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-ink text-white shadow-glow">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-semibold tracking-tight">LinkVault</p>
            <p className="text-xs text-slate-500">Secure share links</p>
          </div>
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link to="/" className="text-slate-600 hover:text-ink">
            Create
          </Link>
          {user && (
            <Link to="/dashboard" className="text-slate-600 hover:text-ink">
              Dashboard
            </Link>
          )}
          {!user ? (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="rounded-full border border-slate-200 px-4 py-2 text-slate-700 hover:border-slate-300"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-ink px-4 py-2 text-white hover:bg-slate-900"
              >
                Create account
              </Link>
            </div>
          ) : (
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-slate-600 hover:border-slate-300"
            >
              <span className="hidden sm:inline">{user.email}</span>
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </nav>
      </div>
    </header>
  )
}
