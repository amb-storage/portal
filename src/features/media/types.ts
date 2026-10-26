import type { ISODate } from '@/lib/api/types'

export type MediaStatus = 'PENDING' | 'READY' | 'FAILED' | 'ARCHIVED'
export const MEDIA_STATUSES = ['PENDING', 'READY', 'FAILED', 'ARCHIVED'] as const

/** Mirrors media-policy.ts on the API. */
export const SUPPORTED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'] as const
export const MAX_MEDIA_SIZE_BYTES = 20 * 1024 * 1024

const OBJECT_PREFIX = 'media/products/'

/** Folder segment of an object key (`media/products/<folder>/<id>/<file>`), like extractMediaFolder on the API. */
export function mediaFolderOf(objectKey: string): string | null {
  if (!objectKey.startsWith(OBJECT_PREFIX)) return null
  const segments = objectKey.slice(OBJECT_PREFIX.length).split('/')
  return segments.length >= 3 ? segments.slice(0, -2).join('/') : null
}

export interface MediaAsset {
  id: string
  objectKey: string
  originalFilename: string | null
  mimeType: string
  sizeBytes: number | null
  width: number | null
  height: number | null
  etag: string | null
  status: MediaStatus
  altJa: string | null
  altEn: string | null
  createdByAdminUserId: string | null
  createdAt: ISODate
  updatedAt: ISODate
  archivedAt: ISODate | null
}

export interface MediaListQuery {
  page: number
  limit: number
  status?: MediaStatus
  mimeType?: string
}

export interface UploadIntent {
  mediaId: string
  uploadUrl: string
  requiredHeaders: Record<string, string>
  expiresAt: ISODate
}
