import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'

export default function AdminChoicePage() {
  const { user, isAdmin, emailConfirmed, loading, roleLoading } = useAuth()
  const navigate = useNavigate()

  if (loading || (user && roleLoading)) {
    return <main className="flex min-h-screen items-center justify-center bg-[#0b0d0d] text-sm text-white/60">Checking sign-in…</main>
  }

  if (!user || !emailConfirmed) {
    return <Navigate to="/login" replace state={{ verificationRequired: Boolean(user) }} />
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0b0d0d] px-4 py-12 text-white">
      <section className="w-full max-w-2xl rounded-[28px] border border-white/10 bg-white/5 p-8 text-center shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-sm sm:p-12">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#49e9dc]">Rk Editing / Studio</p>
        <h1 className="mt-5 text-3xl font-bold tracking-[-0.05em] sm:text-4xl">Welcome back, Admin.</h1>
        <p className="mt-4 text-sm text-white/55">Where would you like to go?</p>
        <div className="mt-9 grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="rounded-full bg-[#49e9dc] px-6 py-4 text-xs font-bold uppercase tracking-[0.14em] text-[#081414] transition hover:bg-[#6ef3e7]"
          >
            Go to Admin Panel
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="rounded-full border border-white/20 bg-white/5 px-6 py-4 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:border-[#49e9dc]/70 hover:text-[#49e9dc]"
          >
            Continue to Website
          </button>
        </div>
      </section>
    </main>
  )
}
