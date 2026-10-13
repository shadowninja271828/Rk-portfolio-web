import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'

const navigation = [
  ['Work', '#selected-works'],
  ['About', '#about'],
  ['Contact', '#contact'],
]

export default function Header() {
  const { user, isAdmin, signOut } = useAuth()
  const [signOutError, setSignOutError] = useState('')

  async function handleSignOut() {
    setSignOutError('')
    try {
      await signOut()
    } catch (error) {
      setSignOutError(error.message || 'Unable to sign out.')
    }
  }

  return (
    <header className="sticky top-0 z-40 px-4 pt-4 sm:px-8">
      <nav className="glass mx-auto flex max-w-7xl items-center justify-between rounded-2xl px-5 py-3 sm:px-7">
        <a href="#top" className="font-display text-sm font-semibold tracking-[.17em] sm:text-base">
          Rk Editing <span className="text-cyan">®</span>
        </a>
        <div className="hidden items-center gap-8 md:flex">
          {navigation.map(([label, href]) => (
            <a key={label} href={href} className="nav-link">
              {label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Link to="/admin" className="button-primary !px-4 !py-2 text-[10px]">
              Admin Panel
            </Link>
          )}
          {user ? (
            <button type="button" onClick={handleSignOut} className="button-outline !px-4 !py-2 text-[10px]">
              Sign out
            </button>
          ) : (
            <Link to="/login" className="button-primary !px-4 !py-2 text-[10px]">
              Sign in
            </Link>
          )}
          <a href="#contact" className="button-outline !px-4 !py-2 text-[10px]">
            Let&apos;s talk <span aria-hidden="true">↗</span>
          </a>
        </div>
      </nav>
      {signOutError && <p className="mx-auto mt-2 max-w-7xl text-right text-xs text-rose-200" role="alert">{signOutError}</p>}
    </header>
  )
}
