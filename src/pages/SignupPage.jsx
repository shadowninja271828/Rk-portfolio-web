import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { isSupabaseConfigured } from '../lib/supabaseClient.js'

export default function SignupPage() {
  const { user, isAdmin, loading: authLoading, roleLoading, signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [accountCreated, setAccountCreated] = useState(false)
  const [error, setError] = useState('')

  if (authLoading || (user && roleLoading)) {
    return <main className="flex min-h-screen items-center justify-center bg-[#0b0d0d] text-sm text-white/60">Checking sign-in…</main>
  }

  if (user && !accountCreated && !submitting) {
    return <Navigate to={isAdmin ? '/admin-choice' : '/'} replace />
  }

  async function handleSignup(event) {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      await signUp(email, password)
      setAccountCreated(true)
    } catch (signupError) {
      setError(signupError.message || 'Unable to create your account. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0b0d0d] px-4 py-10 text-white">
      <section className="w-full max-w-md rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-sm sm:p-8">
        <div className="mb-8 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#49e9dc]">Rk Editing / Studio</p>
          <h1 className="mt-4 text-3xl font-bold uppercase tracking-[-0.06em] text-white">Create Account</h1>
          <p className="mt-3 text-sm text-white/55">Join the RK Editing portfolio.</p>
        </div>

        {!isSupabaseConfigured ? (
          <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-3 text-center text-sm text-rose-200" role="alert">
            Supabase is not configured. Set the Supabase URL and anon key to enable account creation.
          </p>
        ) : accountCreated ? (
          <div className="space-y-5 text-center">
            <p className="rounded-xl border border-[#49e9dc]/30 bg-[#49e9dc]/10 px-4 py-4 text-sm leading-6 text-[#9af7ef]" role="status">
              Account created! Please check your email to verify your account before logging in.
            </p>
            <Link to="/login" className="inline-flex w-full justify-center rounded-full bg-[#49e9dc] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#081414] transition hover:bg-[#6ef3e7]">
              Continue to Sign In
            </Link>
          </div>
        ) : (
          <form className="space-y-5" onSubmit={handleSignup}>
            <div>
              <label htmlFor="signup-email" className="mb-2 block text-[10px] font-medium uppercase tracking-[0.18em] text-white/60">
                Email
              </label>
              <input
                id="signup-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="w-full rounded-full border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition duration-200 focus:border-[#49e9dc] focus:ring-2 focus:ring-[#49e9dc]/40"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="signup-password" className="mb-2 block text-[10px] font-medium uppercase tracking-[0.18em] text-white/60">
                Password
              </label>
              <input
                id="signup-password"
                type="password"
                autoComplete="new-password"
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="w-full rounded-full border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition duration-200 focus:border-[#49e9dc] focus:ring-2 focus:ring-[#49e9dc]/40"
                placeholder="At least 6 characters"
              />
            </div>

            {error && (
              <p className="rounded-xl border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-center text-sm text-rose-200" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-[#49e9dc] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#081414] transition hover:bg-[#6ef3e7] disabled:cursor-not-allowed disabled:bg-[#49e9dc]/70 disabled:text-[#081414]/80"
            >
              {submitting ? 'Creating Account...' : 'Create Account'}
            </button>
            <p className="text-center text-sm text-white/55">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-[#49e9dc] transition hover:text-[#8af5ec]">
                Sign in
              </Link>
            </p>
          </form>
        )}
      </section>
    </main>
  )
}
