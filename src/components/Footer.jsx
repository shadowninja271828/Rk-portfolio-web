export default function Footer() {
  return (
    <footer className="border-t border-white/10 px-5 py-7 sm:px-10">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 text-[10px] uppercase tracking-[.17em] text-white/40 sm:flex-row">
        <span>© {new Date().getFullYear()} Rk Editing · Independent editor & colorist</span>
        <a href="/admin" className="transition-colors hover:text-cyan">Studio access ↗</a>
      </div>
    </footer>
  )
}
