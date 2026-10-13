import { useState } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient.js'

export default function AdminSettings() {
  const { user } = useAuth()
  const [newEmail, setNewEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setSuccess('')
    setError('')

    try {
      if (!supabase) throw new Error('Supabase is not configured.')
      const { error: updateError } = await supabase.auth.updateUser({ email: newEmail.trim() })
      if (updateError) throw updateError

      setSuccess('Verification link sent! Please check the inbox of your new email to confirm the change. Your login will not change until you click that link.')
      setNewEmail('')
    } catch (updateError) {
      setError(updateError.message || 'Unable to request an admin email change.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="admin-panel mt-10">
      <p className="section-kicker">Security &amp; Access</p>
      <h2 className="mt-2 font-display text-2xl">Change Admin Email</h2>
      <p className="mt-4 text-sm text-white/55">Current admin email: <span className="text-white">{user?.email || 'Unavailable'}</span></p>

      <form className="mt-6 max-w-xl space-y-4" onSubmit={handleSubmit}>
        <label className="form-label">New Admin Email
          <input
            className="form-input"
            type="email"
            autoComplete="email"
            required
            value={newEmail}
            onChange={(event) => setNewEmail(event.target.value)}
            placeholder="new-address@example.com"
          />
        </label>
        {!isSupabaseConfigured && (
          <p className="text-sm text-rose-200" role="alert">Supabase is not configured.</p>
        )}
        {error && <p className="text-sm text-rose-200" role="alert">{error}</p>}
        {success && (
          <p className="rounded-xl border border-cyan/30 bg-cyan/10 px-4 py-3 text-sm leading-6 text-cyan" role="status">
            {success}
          </p>
        )}
        <button
          className="button-primary w-full justify-center disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          type="submit"
          disabled={loading || !isSupabaseConfigured}
        >
          {loading ? 'UPDATING...' : 'Update admin email'}
        </button>
      </form>
    </section>
  )
}
