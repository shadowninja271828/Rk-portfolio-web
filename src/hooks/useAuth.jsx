import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient.js'

const AuthContext = createContext(null)
const DEFAULT_ADMIN_EMAIL = 'shadowninja2.71828@gmail.com'

function matchesDefaultAdminEmail(user) {
  return user?.email?.trim().toLowerCase() === DEFAULT_ADMIN_EMAIL
}

async function checkAdminMembership(user) {
  if (!user) return false
  const defaultAdmin = matchesDefaultAdminEmail(user)
  if (!supabase) return defaultAdmin

  const { data, error } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) throw error
  return Boolean(data) || defaultAdmin
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [roleLoading, setRoleLoading] = useState(false)
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    if (!supabase) return undefined

    let active = true
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (active) {
        setAuthError('')
        setSession(nextSession)
        setLoading(false)
      }
    })

    supabase.auth.getSession()
      .then(({ data, error }) => {
        if (!active) return
        if (error) setAuthError(error.message)
        setSession(data.session)
        setLoading(false)
      })
      .catch((error) => {
        if (!active) return
        setAuthError(error.message || 'Unable to restore the Supabase session.')
        setSession(null)
        setLoading(false)
      })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    const user = session?.user
    if (!user) {
      setIsAdmin(false)
      setRoleLoading(false)
      return undefined
    }

    let active = true
    setIsAdmin(false)
    setRoleLoading(true)
    checkAdminMembership(user)
      .then((hasMembership) => {
        if (active) {
          setAuthError('')
          setIsAdmin(hasMembership)
          setRoleLoading(false)
        }
      })
      .catch((error) => {
        if (!active) return
        setAuthError(`Unable to verify admin role: ${error.message}`)
        setIsAdmin(matchesDefaultAdminEmail(user))
        setRoleLoading(false)
      })

    return () => {
      active = false
    }
  }, [session?.user?.id, session?.user?.email])

  const value = useMemo(() => ({
    session,
    user: session?.user ?? null,
    isAdmin,
    roleLoading,
    emailConfirmed: Boolean(session?.user?.email_confirmed_at),
    loading,
    authError,
    async signIn(email, password) {
      if (!supabase) throw new Error('Supabase is not configured.')
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })
      if (error) throw error
      setSession(data.session)
      setRoleLoading(true)
      let signedInIsAdmin
      try {
        signedInIsAdmin = await checkAdminMembership(data.user)
        setAuthError('')
      } catch (membershipError) {
        setAuthError(`Unable to verify admin role: ${membershipError.message}`)
        signedInIsAdmin = matchesDefaultAdminEmail(data.user)
      }
      setIsAdmin(signedInIsAdmin)
      setRoleLoading(false)
      return { ...data, isAdmin: signedInIsAdmin }
    },
    async signUp(email, password) {
      if (!supabase) throw new Error('Supabase is not configured.')
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
        },
      })
      if (error) throw error
      setSession(data.session)
      return data
    },
    async signOut() {
      if (!supabase) throw new Error('Supabase is not configured.')
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    },
  }), [session, isAdmin, roleLoading, loading, authError])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider.')
  return context
}
