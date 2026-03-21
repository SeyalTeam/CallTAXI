const STORAGE_ROOT_PREFIX = 'Call Taxi'

const trimLeadingSlash = (value: string) => value.replace(/^\/+/, '')
const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '')

const encodePath = (value: string) =>
  value
    .split('/')
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join('/')

export const getStoragePublicBaseURL = () => {
  const baseURL = process.env.NEXT_PUBLIC_S3_PUBLIC_URL || process.env.S3_PUBLIC_URL || ''
  return trimTrailingSlash(baseURL)
}

export const getPublicAssetURL = (relativePath: string, fallbackPath?: string) => {
  const baseURL = getStoragePublicBaseURL()

  if (!baseURL) {
    return `/${trimLeadingSlash(fallbackPath || relativePath)}`
  }

  const key = [STORAGE_ROOT_PREFIX, trimLeadingSlash(relativePath)].join('/')
  return `${baseURL}/${encodePath(key)}`
}

export const getUploadedFileURL = (filename: string, prefix?: string | null) => {
  const baseURL = getStoragePublicBaseURL()
  if (!baseURL) return ''

  const key = [prefix, filename].filter(Boolean).join('/')
  return `${baseURL}/${encodePath(key)}`
}
