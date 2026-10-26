import { z } from 'zod'
import { optionalEnum, optionalText, pageParam } from '@/lib/search'
import { INQUIRY_CATEGORIES, INQUIRY_STATUSES } from './types'

export const inquirySearchSchema = z.object({
  page: pageParam,
  q: optionalText,
  status: optionalEnum(INQUIRY_STATUSES),
  category: optionalEnum(INQUIRY_CATEGORIES),
})

export type InquirySearch = z.infer<typeof inquirySearchSchema>
