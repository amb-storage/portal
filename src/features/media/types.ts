import type { ISODate } from '@/lib/api/types'

export type MediaStatus = 'PENDING' | 'READY' | 'FAILED' | 'ARCHIVED'
export const MEDIA_STATUSES = ['PENDING', 'READY', 'FAILED', 'ARCHIVED'] as const

/** Mirrors media-policy.ts on the API. */
export const SUPPORTED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'] as const
export const MAX_MEDIA_SIZE_BYTES = 20 * 1024 * 1024

const OBJECT_PREFIX = 'media/products/'

/** `folder` search value for images uploaded without a folder (API folders never start with "/"). */
export const ROOT_FOLDER = '/'

/** Folder segment of an object key (`media/products/<folder>/<id>/<file>`), like extractMediaFolder on the API. */
export function mediaFolderOf(objectKey: string): string | null {
  if (!objectKey.startsWith(OBJECT_PREFIX)) return null
  const segments = objectKey.slice(OBJECT_PREFIX.length).split('/')
  return segments.length >= 3 ? segments.slice(0, -2).join('/') : null
}

/** "a/b/c" → ["a", "a/b", "a/b/c"]. */
export const folderAncestors = (folder: string) => folder.split('/').map((_, index, parts) => parts.slice(0, index + 1).join('/'))

export const parentFolder = (folder: string) => (folder.includes('/') ? folder.slice(0, folder.lastIndexOf('/')) : null)

export const folderName = (folder: string) => folder.slice(folder.lastIndexOf('/') + 1)

/** True when `folder` is `target` or one of its subfolders. */
export const isInFolder = (folder: string | null, target: string) => folder === target || Boolean(folder?.startsWith(`${target}/`))

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
