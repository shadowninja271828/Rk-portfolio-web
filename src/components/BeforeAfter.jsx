import { useState } from 'react'

export default function BeforeAfter({ settings = {} }) {
  const [position, setPosition] = useState(52)

  return (
    <section id="color-lab" className="section-wrap">
      <div className="section-heading">
        <div>
          <p className="section-kicker">02 / Color lab</p>
          <h2 className="section-title">{settings.color_title} <span>{settings.color_title_accent}</span></h2>
        </div>
        <p className="hidden max-w-xs text-xs leading-6 text-white/45 sm:block">{settings.color_description}</p>
      </div>
      <div className="before-after" style={{ '--position': `${position}%` }}>
        <img src={settings.color_after_image_url || '/images/night-drive.jpg'} alt="Final cinematic color grade" loading="lazy" decoding="async" />
        <img className="before-image" src={settings.color_before_image_url || '/images/before-grade.jpg'} alt="Image before color grading" loading="lazy" decoding="async" />
        <div className="comparison-line" aria-hidden="true"><span>↔</span></div>
        <span className="comparison-label comparison-before">{settings.color_before_label}</span>
        <span className="comparison-label comparison-after">{settings.color_after_label}</span>
        <input
          type="range"
          min="0"
          max="100"
          value={position}
          onChange={(event) => setPosition(Number(event.target.value))}
          aria-label="Compare original footage with final color grade"
        />
      </div>
      <div className="mt-4 flex items-center justify-between text-[9px] uppercase tracking-[.18em] text-white/45">
        <span>{settings.color_camera}</span>
        <span>{settings.color_workflow}</span>
      </div>
    </section>
  )
}
