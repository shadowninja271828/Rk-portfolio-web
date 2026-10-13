function normalizePhone(phone) {
  return phone.replace(/[^\d+]/g, '')
}

export default function ContactLinks({ settings, error }) {
  const phone = settings.phone?.trim()
  const actions = [
    phone && { label: 'Call the studio', detail: phone, href: `tel:${normalizePhone(phone)}`, mark: '01' },
    settings.whatsapp_url && { label: 'WhatsApp', detail: 'A quick hello works too', href: settings.whatsapp_url, mark: '02' },
    settings.instagram_url && { label: 'Instagram', detail: 'Behind the scenes & recent work', href: settings.instagram_url, mark: '03' },
  ].filter(Boolean)

  return (
    <section id="contact" className="contact-section">
      <div className="section-wrap !py-20 sm:!py-28">
        <div className="grid gap-12 md:grid-cols-[1fr_.8fr] md:items-end">
          <div>
            <p className="section-kicker">03 / Your next frame</p>
            <h2 className="font-display text-[clamp(3rem,8vw,6rem)] leading-[.9] tracking-[-.07em]">
              Have a good<br /><span className="text-cyan">story?</span>
            </h2>
            <p className="mt-6 max-w-md text-sm leading-7 text-white/55">Tell me what you&apos;re making. Let&apos;s find the right rhythm for it.</p>
          </div>
          <div className="space-y-2">
            {actions.map((action) => (
              <a className="contact-link" href={action.href} key={action.label} target={action.href.startsWith('http') ? '_blank' : undefined} rel={action.href.startsWith('http') ? 'noreferrer' : undefined}>
                <span className="text-[9px] tracking-[.16em] text-cyan">{action.mark}</span>
                <span className="flex-1">
                  <span className="block font-display text-base">{action.label}</span>
                  <span className="mt-1 block text-[10px] text-white/45">{action.detail}</span>
                </span>
                <span className="text-lg text-white/50 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">↗</span>
              </a>
            ))}
            {error && <p className="text-xs text-rose-300">Contact links couldn&apos;t load: {error}</p>}
            {!error && actions.length === 0 && <p className="text-xs leading-6 text-white/45">Contact links will appear here once the studio details are added.</p>}
          </div>
        </div>
        <div id="about" className="mt-20 flex flex-col justify-between gap-4 border-t border-white/10 pt-5 text-[9px] uppercase tracking-[.17em] text-white/40 sm:flex-row">
          <span>Independent by choice · Collaborative by nature</span>
          <span>Based in India</span>
        </div>
      </div>
    </section>
  )
}
