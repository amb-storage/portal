import { z } from 'zod'
import { optionalEnum, optionalText, pageParam } from '@/lib/search'
import { MEDIA_STATUSES, SUPPORTED_MIME_TYPES } from './types'

export const mediaSearchSchema = z.object({
  page: pageParam,
  status: optionalEnum(MEDIA_STATUSES),
  mimeType: optionalEnum(SUPPORTED_MIME_TYPES),
  /** Folder path being browsed; ROOT_FOLDER = images without a folder; absent = all images. */
  folder: optionalText,
})

export type MediaSearch = z.infer<typeof mediaSearchSchema>
