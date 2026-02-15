import { Shield, Clock, Zap, Lock } from "lucide-react"
import UploadForm from "../components/UploadForm"
import DeletePanel from "../components/DeletePanel"

export default function Home() {
  return (
    <div className="space-y-16 px-6 pb-20">
      <section className="mx-auto max-w-6xl pt-8">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-4 py-1 text-xs uppercase tracking-[0.2em] text-slate-600">
              Secure link-based sharing
            </p>
            <h1 className="text-balance text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
              Share text or files with one private link.
            </h1>
            <p className="text-lg text-slate-600">
              LinkVault lets you upload text or files, lock them with passwords, and set
              auto-expiration. No accounts required, but power features are ready when you sign in.
            </p>
            <div className="flex flex-wrap gap-3 text-sm text-slate-600">
              <span className="rounded-full border border-slate-200 bg-white/70 px-4 py-2">
                One-time views
              </span>
              <span className="rounded-full border border-slate-200 bg-white/70 px-4 py-2">
                Max view/download limits
              </span>
              <span className="rounded-full border border-slate-200 bg-white/70 px-4 py-2">
                Password protection
              </span>
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-glow">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-ink p-3 text-white">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Built for privacy</p>
                  <p className="text-xs text-slate-500">No browsing, no public listing.</p>
                </div>
              </div>
              <div className="grid gap-3 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-ocean" />
                  Expire links automatically
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-ember" />
                  Password lock and owner-only access
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-mint" />
                  Upload text or any file type
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-8" id="create">
        <UploadForm />
        <DeletePanel />
      </section>
    </div>
  )
}
