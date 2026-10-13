import { useCallback, useEffect, useState } from 'react'
import { defaultSiteSettings, getSiteSettings } from '../lib/siteSettings.js'
import { SITE_SETTINGS_UPDATED_EVENT } from '../lib/siteSettings.js'

export function useSiteSettings() {
  const [settings, setSettings] = useState(defaultSiteSettings)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setSettings(await getSiteSettings())
    } catch (err) {
      setError(err.message || 'Unable to load contact details.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
    function syncLocalSettings(event) {
      if (event.type !== 'storage' || event.key === 'rk-editing-site-settings') refresh()
    }

    window.addEventListener(SITE_SETTINGS_UPDATED_EVENT, syncLocalSettings)
    window.addEventListener('storage', syncLocalSettings)
    return () => {
      window.removeEventListener(SITE_SETTINGS_UPDATED_EVENT, syncLocalSettings)
      window.removeEventListener('storage', syncLocalSettings)
    }
  }, [refresh])

  return { settings, setSettings, loading, error, refresh }
}
