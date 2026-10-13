import { isSupabaseConfigured, supabase } from './supabaseClient.js'
import {
  deletePortfolioImagesBestEffort,
  uploadPortfolioMedia,
} from './mediaStorage.js'

const LOCAL_PORTFOLIO_KEY = 'rk-editing-portfolio-items'
export const PORTFOLIO_UPDATED_EVENT = 'rk-editing:portfolio-updated'

export const previewItems = [
  {
    id: 'preview-night-drive',
    title: 'After Hours',
    media_type: 'image',
    media_url: '/images/night-drive.jpg',
    description: 'A study in light, speed, and the city after dark.',
  },
  {
    id: 'preview-editorial',
    title: 'In Her Element',
    media_type: 'image',
    media_url: '/images/editorial-portrait.jpg',
    description: 'An intimate portrait shaped by shadow and texture.',
  },
  {
    id: 'preview-hero',
    title: 'Electric Silence',
    media_type: 'image',
    media_url: '/images/hero-car.jpg',
    description: 'A concept car against an endless midnight coast.',
  },
]

export async function getPortfolioItems() {
  if (!isSupabaseConfigured) {
    if (typeof window !== 'undefined') {
      const localItems = window.localStorage.getItem(LOCAL_PORTFOLIO_KEY)
      if (localItems !== null) return { data: JSON.parse(localItems), isPreview: false }
    }
    return { data: previewItems, isPreview: true }
  }

  const { data, error } = await supabase
    .from('portfolio_items')
    .select('id, title, category, media_type, media_url, description, sort_order')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) throw error
  return { data, isPreview: false }
}

export function saveLocalPortfolioItems(items) {
  if (typeof window === 'undefined') throw new Error('Portfolio items can only be edited in a browser.')
  window.localStorage.setItem(LOCAL_PORTFOLIO_KEY, JSON.stringify(items))
  window.dispatchEvent(new Event(PORTFOLIO_UPDATED_EVENT))
}

export async function savePortfolioItem(item, mediaFile, onUploadProgress) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured. Portfolio updates cannot be published.')
  }

  const { id, ...values } = item
  let previousMediaUrl = ''
  let uploadedMediaUrl = ''

  if (id) {
    const { data, error } = await supabase
      .from('portfolio_items')
      .select('media_url')
      .eq('id', id)
      .single()
    if (error) throw error
    previousMediaUrl = data.media_url
  }

  if (mediaFile) {
    uploadedMediaUrl = await uploadPortfolioMedia(mediaFile, item.media_type, onUploadProgress)
    values.media_url = uploadedMediaUrl
  }

  if (!values.media_url?.trim()) {
    throw new Error('Add a media URL or choose a file to upload.')
  }

  const query = supabase.from('portfolio_items')
  let result
  try {
    result = id
      ? await query.update(values).eq('id', id).select().single()
      : await query.insert(values).select().single()
  } catch (saveError) {
    if (uploadedMediaUrl) {
      throw new Error(`${saveError.message} The uploaded media was kept because the database save outcome could not be confirmed.`)
    }
    throw saveError
  }

  if (result.error) {
    if (uploadedMediaUrl && result.error.status >= 400 && result.error.status < 500) {
      const cleanupWarning = await deletePortfolioImagesBestEffort([uploadedMediaUrl])
      if (cleanupWarning) {
        throw new Error(`${result.error.message} The newly uploaded media could not be cleaned up: ${cleanupWarning}`)
      }
    } else if (uploadedMediaUrl) {
      throw new Error(`${result.error.message} The uploaded media was kept because the database save outcome could not be confirmed.`)
    }
    throw result.error
  }

  const cleanupWarning = previousMediaUrl && previousMediaUrl !== values.media_url
    ? await deletePortfolioImagesBestEffort([previousMediaUrl])
    : ''

  return { data: result.data, cleanupWarning }
}

export async function deletePortfolioItem(id) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured. Portfolio items cannot be deleted.')
  }

  const { data, error } = await supabase
    .from('portfolio_items')
    .delete()
    .eq('id', id)
    .select('media_url')
    .single()

  if (error) throw error
  const cleanupWarning = await deletePortfolioImagesBestEffort([data.media_url])
  return { cleanupWarning }
}
