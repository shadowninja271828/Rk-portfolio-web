import { useEffect, useState } from 'react'
import AdminSettings from '../components/AdminSettings.jsx'
import { usePortfolio } from '../hooks/usePortfolio.js'
import { useSiteSettings } from '../hooks/useSiteSettings.js'
import { deletePortfolioItem, savePortfolioItem } from '../lib/portfolio.js'
import { validateImageFile, validatePortfolioMediaFile } from '../lib/mediaStorage.js'
import { defaultSiteSettings, saveSiteSettings } from '../lib/siteSettings.js'

const emptyItem = { title: '', category: 'Project', media_type: 'image', media_url: '', description: '', sort_order: 0 }

function MediaFileInput({ label, file, mediaType = 'image', onChange, disabled, uploadProgress }) {
  function handleChange(event) {
    const selectedFile = event.target.files?.[0] ?? null
    if (!selectedFile) {
      onChange(null)
      return
    }

    try {
      if (mediaType === 'image') validateImageFile(selectedFile)
      else validatePortfolioMediaFile(selectedFile, mediaType)
      onChange(selectedFile)
    } catch (validationError) {
      event.target.value = ''
      onChange(null, validationError.message)
    }
  }

  return (
    <label className="form-label">
      {label}
      <input
        className="form-input"
        type="file"
        accept={mediaType === 'video'
          ? 'video/mp4,video/webm,video/quicktime,video/x-m4v'
          : 'image/jpeg,image/png,image/webp,image/gif,image/avif'}
        onChange={handleChange}
        disabled={disabled}
      />
      <span className="mt-1 block text-xs text-white/45">
        {file ? `Selected: ${file.name}` : mediaType === 'video'
          ? 'MP4, WebM, MOV, or M4V · up to 50 MB'
          : 'JPEG, PNG, WebP, GIF, or AVIF · up to 10 MB'}
      </span>
      {uploadProgress !== null && uploadProgress !== undefined && (
        <span className="mt-3 block" role="status">
          <span className="mb-1 block text-xs normal-case tracking-normal text-cyan">
            Uploading to cloud storage: {uploadProgress}%
          </span>
          <span
            className="media-upload-progress"
            role="progressbar"
            aria-label="Media upload progress"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuenow={uploadProgress}
          >
            <span style={{ width: `${uploadProgress}%` }} />
          </span>
        </span>
      )}
    </label>
  )
}

export default function AdminPage() {
  const portfolio = usePortfolio()
  const contact = useSiteSettings()
  const [draft, setDraft] = useState(emptyItem)
  const [settingsDraft, setSettingsDraft] = useState(defaultSiteSettings)
  const [portfolioMedia, setPortfolioMedia] = useState(null)
  const [settingsImageFiles, setSettingsImageFiles] = useState({})
  const [busy, setBusy] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => setSettingsDraft({ ...defaultSiteSettings, ...contact.settings }), [contact.settings])

  function updateDraft(event) {
    const { name, value } = event.target
    setDraft((current) => ({ ...current, [name]: name === 'sort_order' ? Number(value) : value }))
    if (name === 'media_url' || name === 'media_type') setPortfolioMedia(null)
  }

  function updateSettings(event) {
    const { name, value } = event.target
    setSettingsDraft((current) => ({ ...current, [name]: value }))
    if (['hero_image_url', 'color_after_image_url', 'color_before_image_url'].includes(name)) {
      setSettingsImageFiles((current) => ({ ...current, [name]: null }))
    }
  }

  function updateSettingsImage(name, file, validationError = '') {
    setSettingsImageFiles((current) => ({ ...current, [name]: file }))
    setError(validationError)
  }

  async function handleItemSubmit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const result = await savePortfolioItem(draft, portfolioMedia, setUploadProgress)
      await portfolio.refresh()
      setDraft(emptyItem)
      setPortfolioMedia(null)
      setMessage(
        (draft.id ? 'Project update published for all visitors.' : 'Project published for all visitors.')
        + (result.cleanupWarning ? ` Previous image cleanup failed: ${result.cleanupWarning}` : ''),
      )
    } catch (err) {
      setError(err.message || 'Unable to save this project.')
    } finally {
      setBusy(false)
      setUploadProgress(null)
    }
  }

  async function handleDelete(item) {
    if (!window.confirm(`Delete “${item.title}” from the published portfolio?`)) return
    setError('')
    setMessage('')
    try {
      const result = await deletePortfolioItem(item.id)
      await portfolio.refresh()
      setMessage(
        'Project removed from the published portfolio.'
        + (result.cleanupWarning ? ` Image cleanup failed: ${result.cleanupWarning}` : ''),
      )
    } catch (err) {
      setError(err.message || 'Unable to delete this project.')
    }
  }

  async function handleSettingsSubmit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const result = await saveSiteSettings(settingsDraft, settingsImageFiles, contact.settings)
      setSettingsDraft(result.settings)
      contact.setSettings(result.settings)
      setSettingsImageFiles({})
      setMessage(
        'Website content published for all visitors.'
        + (result.cleanupWarning ? ` Previous image cleanup failed: ${result.cleanupWarning}` : ''),
      )
    } catch (err) {
      setError(err.message || 'Unable to save website content.')
    } finally {
      setBusy(false)
    }
  }

  function updateStat(index, field, value) {
    setSettingsDraft((current) => ({
      ...current,
      hero_stats: current.hero_stats.map((stat, statIndex) => (
        statIndex === index ? { ...stat, [field]: value } : stat
      )),
    }))
  }

  return (
    <div className="admin-dashboard min-w-0">
      <div className="border-b border-white/10 pb-8">
        <p className="section-kicker">Studio dashboard</p>
        <h1 className="mt-2 font-display text-3xl tracking-tight sm:text-5xl">Edit your website.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50">Manage project cards, homepage copy, images, and contact links.</p>
      </div>

      <div className="notice-banner mt-6" role="note">
        Updates are saved to Supabase and published for all visitors. Changes remain live until you edit or remove them.
        Add images or videos by URL or upload them to Supabase Storage. Uploaded media is removed when replaced or deleted.
      </div>

      {(message || error || portfolio.error || contact.error) && (
        <div className={`my-6 rounded-xl border px-4 py-3 text-sm ${error || portfolio.error || contact.error ? 'border-rose-300/20 bg-rose-300/5 text-rose-200' : 'border-cyan/20 bg-cyan/5 text-cyan'}`} role="status">
          {error || portfolio.error || contact.error || message}
        </div>
      )}

      <div className="mt-8 grid gap-8">
        <section className="admin-panel">
          <p className="section-kicker">Homepage hero</p>
          <h2 className="mt-2 font-display text-2xl">Main introduction and image</h2>
          <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={handleSettingsSubmit}>
            <label className="form-label sm:col-span-2">Hero image URL or path
              <input className="form-input" name="hero_image_url" value={settingsDraft.hero_image_url} onChange={updateSettings} />
            </label>
            <div className="sm:col-span-2">
              <MediaFileInput
                key={settingsImageFiles.hero_image_url?.name ?? 'no-hero-upload'}
                label="Or upload a hero image"
                file={settingsImageFiles.hero_image_url}
                onChange={(file, validationError) => updateSettingsImage('hero_image_url', file, validationError)}
                disabled={busy}
              />
            </div>
            <label className="form-label">Availability label
              <input className="form-input" name="hero_status" maxLength="100" value={settingsDraft.hero_status} onChange={updateSettings} />
            </label>
            <label className="form-label">Location label
              <input className="form-input" name="hero_location" maxLength="100" value={settingsDraft.hero_location} onChange={updateSettings} />
            </label>
            <label className="form-label">Showreel text
              <input className="form-input" name="hero_showreel" maxLength="100" value={settingsDraft.hero_showreel} onChange={updateSettings} />
            </label>
            <label className="form-label">Role / kicker
              <input className="form-input" name="hero_kicker" maxLength="120" value={settingsDraft.hero_kicker} onChange={updateSettings} />
            </label>
            <label className="form-label">Headline, first line
              <input className="form-input" name="hero_title_line1" maxLength="40" value={settingsDraft.hero_title_line1} onChange={updateSettings} />
            </label>
            <label className="form-label">Headline, second line
              <input className="form-input" name="hero_title_line2" maxLength="40" value={settingsDraft.hero_title_line2} onChange={updateSettings} />
            </label>
            <label className="form-label">Headline, accent
              <input className="form-input" name="hero_title_accent" maxLength="40" value={settingsDraft.hero_title_accent} onChange={updateSettings} />
            </label>
            <label className="form-label sm:col-span-2">Introduction
              <textarea className="form-input min-h-20 resize-y" name="hero_description" maxLength="400" value={settingsDraft.hero_description} onChange={updateSettings} />
            </label>
            <label className="form-label">Work button label
              <input className="form-input" name="hero_work_button" maxLength="60" value={settingsDraft.hero_work_button} onChange={updateSettings} />
            </label>
            <label className="form-label">Contact button label
              <input className="form-input" name="hero_contact_button" maxLength="60" value={settingsDraft.hero_contact_button} onChange={updateSettings} />
            </label>

            <div className="sm:col-span-2">
              <p className="form-label mb-3">Homepage stats</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {settingsDraft.hero_stats.map((stat, index) => (
                  <div className="grid gap-3 sm:grid-cols-2" key={index}>
                    <label className="form-label">Value
                      <input className="form-input" maxLength="24" value={stat.value} onChange={(event) => updateStat(index, 'value', event.target.value)} />
                    </label>
                    <label className="form-label">Label
                      <input className="form-input" maxLength="60" value={stat.label} onChange={(event) => updateStat(index, 'label', event.target.value)} />
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <button className="button-primary w-full justify-center disabled:opacity-60 sm:col-span-2 sm:w-auto" disabled={busy}>{busy ? 'Saving…' : 'Save homepage content'}</button>
          </form>
        </section>

        <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
          <section className="admin-panel">
            <p className="section-kicker">Portfolio content</p>
            <h2 className="mt-2 font-display text-2xl">{draft.id ? 'Edit project' : 'Add a project'}</h2>
            <form className="mt-6 grid gap-4" onSubmit={handleItemSubmit}>
              <label className="form-label">Project title
                <input className="form-input" name="title" required maxLength="120" value={draft.title} onChange={updateDraft} />
              </label>
              <label className="form-label">Media type
                <select className="form-input" name="media_type" value={draft.media_type} onChange={updateDraft}>
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
              </label>
              <label className="form-label">Image or video URL
                <input className="form-input" name="media_url" type="text" placeholder="https://… or /images/example.jpg" value={draft.media_url} onChange={updateDraft} />
              </label>
              <MediaFileInput
                key={`${draft.media_type}-${portfolioMedia?.name ?? 'no-project-upload'}`}
                label={`Or upload a ${draft.media_type}`}
                file={portfolioMedia}
                mediaType={draft.media_type}
                onChange={(file, validationError) => {
                  setPortfolioMedia(file)
                  setError(validationError)
                }}
                disabled={busy}
                uploadProgress={uploadProgress}
              />
              <label className="form-label">Short description
                <textarea className="form-input min-h-20 resize-y" name="description" maxLength="280" value={draft.description} onChange={updateDraft} />
              </label>
              <label className="form-label">Display order
                <input className="form-input" name="sort_order" type="number" value={draft.sort_order} onChange={updateDraft} />
              </label>
              <div className="flex items-end gap-2">
                <button className="button-primary flex-1 justify-center disabled:opacity-60" disabled={busy}>{busy ? 'Saving…' : draft.id ? 'Save changes' : 'Add project'}</button>
                {draft.id && <button className="button-outline" type="button" onClick={() => { setDraft(emptyItem); setPortfolioMedia(null) }}>Cancel</button>}
              </div>
            </form>
          </section>

          <section className="admin-panel">
            <p className="section-kicker">Public contact</p>
            <h2 className="mt-2 font-display text-2xl">Contact links</h2>
            <form className="mt-6 space-y-4" onSubmit={handleSettingsSubmit}>
              <label className="form-label">Phone number
                <input className="form-input" name="phone" type="tel" placeholder="+44 20 0000 0000" value={settingsDraft.phone} onChange={updateSettings} />
              </label>
              <label className="form-label">WhatsApp link
                <input className="form-input" name="whatsapp_url" type="url" placeholder="https://wa.me/…" value={settingsDraft.whatsapp_url} onChange={updateSettings} />
              </label>
              <label className="form-label">Instagram link
                <input className="form-input" name="instagram_url" type="url" placeholder="https://instagram.com/…" value={settingsDraft.instagram_url} onChange={updateSettings} />
              </label>
              <button className="button-primary w-full justify-center disabled:opacity-60" disabled={busy}>{busy ? 'Saving…' : 'Save contact and website content'}</button>
            </form>
          </section>
        </div>
      </div>

      <section className="mt-10">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="section-kicker">Published work</p>
            <h2 className="mt-2 font-display text-2xl">Your projects <span className="text-white/40">({portfolio.items.length})</span></h2>
          </div>
          <button className="text-xs text-cyan hover:underline" type="button" onClick={portfolio.refresh}>Refresh</button>
        </div>
        {portfolio.loading ? <p className="py-6 text-sm text-white/50">Loading projects…</p> : (
          <div className="space-y-3">
            {portfolio.items.map((item) => (
              <article key={item.id} className="grid min-w-0 grid-cols-[5rem_minmax(0,1fr)] gap-3 rounded-xl border border-white/10 bg-white/[.025] p-3 sm:flex sm:items-center sm:gap-4 sm:p-4">
                <img src={item.media_type === 'image' ? item.media_url : '/images/hero-car.jpg'} alt="" className="h-20 w-20 rounded-lg object-cover sm:h-16 sm:w-24 sm:shrink-0" />
                <div className="min-w-0 flex-1">
                  <h3 className="break-words text-sm font-medium">{item.title}</h3>
                  <p className="mt-1 break-all text-xs text-white/45">{item.media_type} · {item.media_url}</p>
                </div>
                <div className="col-span-2 flex gap-3 border-t border-white/10 pt-2 sm:col-span-1 sm:shrink-0 sm:border-0 sm:pt-0">
                  <button className="min-h-11 flex-1 rounded-lg px-3 text-xs text-cyan hover:underline sm:flex-none" type="button" onClick={() => { setDraft({ ...item }); setPortfolioMedia(null); window.scrollTo({ top: 0, behavior: 'auto' }) }}>Edit project</button>
                  <button className="min-h-11 flex-1 rounded-lg px-3 text-xs text-rose-300 hover:underline sm:flex-none" type="button" onClick={() => handleDelete(item)}>Delete</button>
                </div>
              </article>
            ))}
            {!portfolio.items.length && !portfolio.error && <p className="rounded-xl border border-white/10 p-5 text-sm text-white/45">No projects yet. Add your first item above.</p>}
          </div>
        )}
      </section>
      <AdminSettings />
    </div>
  )
}
