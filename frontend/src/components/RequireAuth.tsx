import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function RequireAuth({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-16">
        <p className="text-slate-500">Loading...</p>
      </div>
    )
  }
  if (!user) {
    return <Navigate to="/login" replace />
  }
  return children
}
