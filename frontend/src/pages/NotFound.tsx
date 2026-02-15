import { Link } from "react-router-dom"

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-6 py-20 text-center">
      <h1 className="text-3xl font-semibold text-ink">Page not found</h1>
      <p className="mt-2 text-slate-500">That link doesn’t exist or has expired.</p>
      <Link
        to="/"
        className="mt-6 inline-flex rounded-full bg-ink px-4 py-2 text-sm text-white"
      >
        Back to home
      </Link>
    </div>
  )
}
