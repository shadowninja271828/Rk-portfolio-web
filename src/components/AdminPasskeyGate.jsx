import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient.js'

export default function AdminPasskeyGate({ children }) {
  const { user, emailConfirmed, loading, signOut } = useAuth()
  const [isAdmin, setIsAdmin] = useState(null)
  const [error, setError] = useState('')

  async function handleSignOut() {
    try {
      await signOut()
    } catch (signOutError) {
      setError(signOutError.message || 'Unable to sign out.')
    }
  }

  useEffect(() => {
    if (!user || !emailConfirmed || !supabase) {
      setIsAdmin(null)
      setError('')
      return undefined
    }

    let active = true
    setIsAdmin(null)
    setError('')

    supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data, error: adminError }) => {
        if (!active) return
        if (adminError) {
          setError(`Unable to verify admin access: ${adminError.message}`)
          setIsAdmin(false)
        } else {
          setIsAdmin(Boolean(data))
        }
      })
      .catch((adminError) => {
        if (!active) return
        setError(adminError.message || 'Unable to verify admin access.')
        setIsAdmin(false)
      })

    return () => {
      active = false
    }
  }, [user, emailConfirmed])

  if (loading) {
    return <div className="py-24 text-center text-sm text-white/50">Checking sign-in…</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!emailConfirmed) {
    return <Navigate to="/login" replace state={{ verificationRequired: true }} />
  }

  if (!isSupabaseConfigured || isAdmin === null) {
    return <div className="py-24 text-center text-sm text-white/50">Verifying admin access…</div>
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md py-16">
        <section className="admin-panel">
          <p className="section-kicker">Admin access</p>
          <h1 className="mt-3 font-display text-3xl">Access denied</h1>
          <p className="mt-3 text-sm leading-6 text-white/55">
            This account is not registered as an administrator.
          </p>
          {error && <p className="mt-4 text-sm text-rose-200" role="alert">{error}</p>}
          <button className="button-outline mt-6" type="button" onClick={handleSignOut}>Sign out</button>
        </section>
      </div>
    )
  }

  return children ?? <Outlet />
}
