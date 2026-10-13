function ProjectCard({ item, index }) {
  const isTall = index === 1
  return (
    <article className={`project-card group ${isTall ? 'md:mt-20' : ''}`}>
      <div className="project-media">
        {item.media_type === 'video' ? (
          <video src={item.media_url} controls preload="none" aria-label={item.title} />
        ) : (
          <img src={item.media_url} alt={item.title} loading="lazy" decoding="async" />
        )}
        <span className="project-index">0{index + 1}</span>
        <span className="project-open" aria-hidden="true">↗</span>
      </div>
      <div className="flex items-start justify-between gap-4 pt-4">
        <div>
          <h3 className="font-display text-lg tracking-tight sm:text-xl">{item.title}</h3>
          {item.description && <p className="mt-1 max-w-sm text-xs leading-5 text-white/50">{item.description}</p>}
        </div>
      </div>
    </article>
  )
}

export default function Gallery({ items, loading, error, isPreview, onRetry }) {
  return (
    <section id="selected-works" className="section-wrap">
      <div className="section-heading">
        <div>
          <p className="section-kicker">01 / Selected projects</p>
          <h2 className="section-title">Frames that <span>stay.</span></h2>
        </div>
        <p className="hidden max-w-xs text-xs leading-6 text-white/45 sm:block">A collection of stories shaped frame by frame, from the first cut to the final grade.</p>
      </div>

      {isPreview && <p className="notice-banner">Preview projects shown · Connect Supabase to publish your own work.</p>}
      {error && (
        <div className="notice-banner notice-error" role="status">
          Portfolio couldn&apos;t load: {error} <button type="button" onClick={onRetry}>Try again</button>
        </div>
      )}

      {loading ? (
        <p className="py-16 text-center text-sm text-white/50">Loading selected work…</p>
      ) : items.length ? (
        <div className="grid gap-x-6 gap-y-12 md:grid-cols-2 md:gap-y-20">
          {items.map((item, index) => <ProjectCard key={item.id} item={item} index={index} />)}
        </div>
      ) : (
        <p className="py-16 text-center text-sm text-white/50">No projects in this collection yet.</p>
      )}
    </section>
  )
}
