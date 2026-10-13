import { Upload } from 'tus-js-client'
import { supabase } from './supabaseClient.js'
import { supabaseAnonKey, supabaseUrl } from './supabaseClient.js'

export const PORTFOLIO_MEDIA_BUCKET = 'portfolio-media'
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024
export const MAX_VIDEO_SIZE = 50 * 1024 * 1024

const supportedMedia = {
  'image/avif': { extension: 'avif', maxSize: MAX_IMAGE_SIZE },
  'image/gif': { extension: 'gif', maxSize: MAX_IMAGE_SIZE },
  'image/jpeg': { extension: 'jpg', maxSize: MAX_IMAGE_SIZE },
  'image/png': { extension: 'png', maxSize: MAX_IMAGE_SIZE },
  'image/webp': { extension: 'webp', maxSize: MAX_IMAGE_SIZE },
  'video/mp4': { extension: 'mp4', maxSize: MAX_VIDEO_SIZE },
  'video/quicktime': { extension: 'mov', maxSize: MAX_VIDEO_SIZE },
  'video/webm': { extension: 'webm', maxSize: MAX_VIDEO_SIZE },
  'video/x-m4v': { extension: 'm4v', maxSize: MAX_VIDEO_SIZE },
}

function getBucket() {
  if (!supabase) throw new Error('Supabase is not configured. Media cannot be uploaded.')
  return supabase.storage.from(PORTFOLIO_MEDIA_BUCKET)
}

export function validateImageFile(file) {
  if (!file.type.startsWith('image/') || !supportedMedia[file.type]) {
    throw new Error('Choose a JPEG, PNG, WebP, GIF, or AVIF image.')
  }
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error('Images must be 10 MB or smaller.')
  }
}

export function validatePortfolioMediaFile(file, mediaType) {
  const media = supportedMedia[file.type]
  if (!media || !file.type.startsWith(`${mediaType}/`)) {
    throw new Error(mediaType === 'video'
      ? 'Choose an MP4, WebM, MOV, or M4V video.'
      : 'Choose a JPEG, PNG, WebP, GIF, or AVIF image.')
  }
  if (file.size > media.maxSize) {
    throw new Error(mediaType === 'video'
      ? 'Videos must be 50 MB or smaller.'
      : 'Images must be 10 MB or smaller.')
  }
}

export async function uploadPortfolioImage(file, onProgress) {
  validateImageFile(file)
  return uploadPortfolioMedia(file, 'image', onProgress)
}

export async function uploadPortfolioMedia(file, mediaType, onProgress) {
  validatePortfolioMediaFile(file, mediaType)
  if (!supabase || !supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase is not configured. Media cannot be uploaded.')
  }

  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  if (sessionError) throw sessionError
  if (!session?.access_token) throw new Error('Sign in again before uploading media.')

  const path = `${crypto.randomUUID()}.${supportedMedia[file.type].extension}`
  const bucket = getBucket()
  await new Promise((resolve, reject) => {
    const upload = new Upload(file, {
      endpoint: `${supabaseUrl}/storage/v1/upload/resumable`,
      chunkSize: 6 * 1024 * 1024,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      headers: {
        apikey: supabaseAnonKey,
        authorization: `Bearer ${session.access_token}`,
      },
      metadata: {
        bucketName: PORTFOLIO_MEDIA_BUCKET,
        objectName: path,
        contentType: file.type,
        cacheControl: '31536000',
      },
      removeFingerprintOnSuccess: true,
      onProgress(bytesUploaded, bytesTotal) {
        onProgress?.(Math.round((bytesUploaded / bytesTotal) * 100))
      },
      onError: reject,
      onSuccess: resolve,
    })

    upload.start()
  })

  return bucket.getPublicUrl(path).data.publicUrl
}

function getManagedMediaPath(url) {
  if (!url || !supabase) return null

  const publicUrl = getBucket().getPublicUrl('__portfolio_media_path_check__').data.publicUrl
  const publicUrlParts = new URL(publicUrl)
  const imageUrlParts = new URL(url, publicUrlParts.origin)
  const bucketPath = `/storage/v1/object/public/${PORTFOLIO_MEDIA_BUCKET}/`

  if (imageUrlParts.origin !== publicUrlParts.origin || !imageUrlParts.pathname.startsWith(bucketPath)) {
    return null
  }

  const path = decodeURIComponent(imageUrlParts.pathname.slice(bucketPath.length))
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(avif|gif|jpg|m4v|mov|mp4|png|webm|webp)$/i.test(path)
    ? path
    : null
}

export async function deletePortfolioImages(urls) {
  const paths = [...new Set(urls.map(getManagedMediaPath).filter(Boolean))]
  if (!paths.length) return

  const { error } = await getBucket().remove(paths)
  if (error) throw error
}

export async function deletePortfolioImagesBestEffort(urls) {
  try {
    await deletePortfolioImages(urls)
    return ''
  } catch (error) {
    return error.message || 'Unable to remove unused uploaded media.'
  }
}
