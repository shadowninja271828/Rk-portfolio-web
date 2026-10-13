import { Outlet } from 'react-router-dom'

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-ink text-white">
      <header className="admin-header border-b border-white/10 px-4 py-4 sm:px-10 sm:py-5">
        <div className="admin-header-inner mx-auto flex max-w-7xl items-center justify-between gap-3">
          <a href="/" className="flex min-h-11 items-center font-display text-xs font-semibold tracking-[.14em] sm:text-sm sm:tracking-[.18em]">
            RK EDITING <span className="text-cyan">/ STUDIO</span>
          </a>
          <a href="/" className="flex min-h-11 shrink-0 items-center text-[9px] uppercase tracking-[.12em] text-muted transition-colors hover:text-cyan sm:text-xs sm:tracking-[.18em]">
            ← View portfolio
          </a>
        </div>
      </header>
      <main className="admin-main mx-auto max-w-7xl px-4 py-7 sm:px-10 sm:py-10">
        <Outlet />
      </main>
    </div>
  )
}
