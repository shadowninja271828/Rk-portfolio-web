export default function Hero({ settings = {} }) {
  const stats = settings.hero_stats ?? []

  return (
    <section id="top" className="hero-shell mx-auto mt-4 flex min-h-[760px] max-w-[1600px] flex-col justify-between overflow-hidden rounded-[28px] px-6 pb-8 pt-7 sm:min-h-[800px] sm:px-12 sm:pb-10 sm:pt-9 lg:px-16">
      <img
        src={settings.hero_image_url || '/images/hero-car.jpg'}
        alt="Sleek concept car cutting across a dark coastal road"
        className="hero-image"
        fetchPriority="high"
        decoding="async"
      />
      <div className="hero-shade" aria-hidden="true" />
      <div className="relative z-10 flex items-start justify-between border-b border-white/15 pb-4">
        <div className="flex flex-wrap gap-2">
          <span className="eyebrow-pill"><span className="status-dot" /> {settings.hero_status}</span>
          <span className="eyebrow-pill hidden sm:inline-flex">{settings.hero_location}</span>
        </div>
        <span className="hidden text-[10px] uppercase tracking-[.2em] text-white/60 sm:block">{settings.hero_showreel}</span>
      </div>

      <div className="relative z-10 max-w-4xl py-20 sm:py-28">
        <p className="mb-5 text-[10px] uppercase tracking-[.28em] text-cyan sm:text-xs">{settings.hero_kicker}</p>
        <h1 className="font-display text-[clamp(3.5rem,10vw,8.5rem)] font-medium uppercase leading-[.86] tracking-[-.075em]">
          {settings.hero_title_line1}<br />{settings.hero_title_line2} <span className="text-cyan">{settings.hero_title_accent}</span>
        </h1>
        <p className="mt-7 max-w-xl text-sm leading-7 text-white/70 sm:text-base">
          {settings.hero_description}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="#selected-works" className="button-primary">{settings.hero_work_button} <span aria-hidden="true">↘</span></a>
          <a href="#contact" className="button-outline">{settings.hero_contact_button} <span aria-hidden="true">↗</span></a>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-2 gap-5 border-t border-white/15 pt-5 sm:grid-cols-4 sm:gap-8">
        {stats.map(({ value, label }, index) => (
          <div key={`${label}-${index}`}>
            <p className="font-display text-2xl text-cyan sm:text-3xl">{value}</p>
            <p className="mt-1 text-[9px] uppercase tracking-[.16em] text-white/55 sm:text-[10px]">{label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
