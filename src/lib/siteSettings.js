import { isSupabaseConfigured, supabase } from './supabaseClient.js'
import {
  deletePortfolioImagesBestEffort,
  uploadPortfolioImage,
} from './mediaStorage.js'

const LOCAL_SETTINGS_KEY = 'rk-editing-site-settings'
export const SITE_SETTINGS_UPDATED_EVENT = 'rk-editing:site-settings-updated'
const imageSettingKeys = ['hero_image_url', 'color_after_image_url', 'color_before_image_url']

export const defaultSiteSettings = {
  hero_image_url: '/images/hero-car.jpg',
  hero_status: 'Available for select projects',
  hero_location: 'Working in India',
  hero_showreel: 'Showreel 2025 · 02:39',
  hero_kicker: 'Editor · Photo Editor · Photographer',
  hero_title_line1: 'Stories',
  hero_title_line2: 'in',
  hero_title_accent: 'motion.',
  hero_description: 'Crafted with intention. Cut with feeling. I shape moving images into worlds you can step inside.',
  hero_work_button: 'Explore selected work',
  hero_contact_button: 'Start a project',
  hero_stats: [
    { value: '140M+', label: 'Cumulative views' },
    { value: '14', label: 'Festival laurels' },
    { value: '09 yrs', label: 'In the edit suite' },
    { value: '4.5K', label: 'Open gate workflow' },
  ],
  color_title: 'The feeling is',
  color_title_accent: 'in the grade.',
  color_description: 'A single image, two worlds. Drag to reveal the final color grade.',
  color_after_image_url: '/images/night-drive.jpg',
  color_before_image_url: '/images/before-grade.jpg',
  color_before_label: 'LOG / RAW',
  color_after_label: 'FINAL GRADE',
  color_camera: 'ARRI ALEXA 35 · OPEN GATE 4.5K',
  color_workflow: 'ACES · DAVINCI RESOLVE',
  phone: '',
  whatsapp_url: '',
  instagram_url: '',
}

export async function getSiteSettings() {
  if (!isSupabaseConfigured) {
    if (typeof window !== 'undefined') {
      const localSettings = window.localStorage.getItem(LOCAL_SETTINGS_KEY)
      if (localSettings !== null) {
        const settings = { ...defaultSiteSettings, ...JSON.parse(localSettings) }
        if (settings.hero_location === 'London · Working worldwide') {
          settings.hero_location = defaultSiteSettings.hero_location
        }
        if (settings.hero_kicker === 'Editor · Colorist · Visual storyteller') {
          settings.hero_kicker = defaultSiteSettings.hero_kicker
        }
        return settings
      }
    }
    return { ...defaultSiteSettings }
  }

  const { data, error } = await supabase
    .from('site_settings')
    .select('phone, whatsapp_url, instagram_url, content')
    .eq('id', 1)
    .maybeSingle()

  if (error) throw error
  const { content, phone, whatsapp_url, instagram_url } = data ?? {}
  return {
    ...defaultSiteSettings,
    phone: phone ?? defaultSiteSettings.phone,
    whatsapp_url: whatsapp_url ?? defaultSiteSettings.whatsapp_url,
    instagram_url: instagram_url ?? defaultSiteSettings.instagram_url,
    ...(content ?? {}),
  }
}

export async function saveSiteSettings(settings, imageFiles = {}, previousSettings = settings) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured. Website updates cannot be published.')
  }

  const updatedSettings = { ...settings }
  const uploadedUrls = []
  try {
    for (const key of imageSettingKeys) {
      if (imageFiles[key]) {
        updatedSettings[key] = await uploadPortfolioImage(imageFiles[key])
        uploadedUrls.push(updatedSettings[key])
      }
    }
  } catch (uploadError) {
    const cleanupWarning = await deletePortfolioImagesBestEffort(uploadedUrls)
    if (cleanupWarning) {
      throw new Error(`${uploadError.message} Previously uploaded files from this attempt could not be cleaned up: ${cleanupWarning}`)
    }
    throw uploadError
  }

  let saveError
  try {
    const { error } = await supabase
      .from('site_settings')
      .upsert({
        id: 1,
        phone: updatedSettings.phone ?? '',
        whatsapp_url: updatedSettings.whatsapp_url ?? '',
        instagram_url: updatedSettings.instagram_url ?? '',
        content: updatedSettings,
        updated_at: new Date().toISOString(),
      })
    saveError = error
  } catch (requestError) {
    saveError = requestError
  }
  if (saveError) {
    if (uploadedUrls.length && saveError.status >= 400 && saveError.status < 500) {
      const cleanupWarning = await deletePortfolioImagesBestEffort(uploadedUrls)
      if (cleanupWarning) {
        throw new Error(`${saveError.message} Newly uploaded images could not be cleaned up: ${cleanupWarning}`)
      }
    } else if (uploadedUrls.length) {
      throw new Error(`${saveError.message} Uploaded images were kept because the database save outcome could not be confirmed.`)
    }
    throw saveError
  }

  const replacedImageUrls = imageSettingKeys
    .filter((key) => previousSettings[key] && previousSettings[key] !== updatedSettings[key])
    .map((key) => previousSettings[key])
  const cleanupWarning = await deletePortfolioImagesBestEffort(replacedImageUrls)
  window.dispatchEvent(new Event(SITE_SETTINGS_UPDATED_EVENT))
  return { settings: updatedSettings, cleanupWarning }
}
