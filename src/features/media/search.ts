import { z } from 'zod'
import { optionalEnum, pageParam } from '@/lib/search'
import { MEDIA_STATUSES, SUPPORTED_MIME_TYPES } from './types'

export const mediaSearchSchema = z.object({
  page: pageParam,
  status: optionalEnum(MEDIA_STATUSES),
  mimeType: optionalEnum(SUPPORTED_MIME_TYPES),
})

export type MediaSearch = z.infer<typeof mediaSearchSchema>
