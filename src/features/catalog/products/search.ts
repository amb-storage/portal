import { z } from 'zod'
import { optionalEnum, optionalText, pageParam } from '@/lib/search'
import { PRODUCT_SORTS, PRODUCT_STATUSES } from './types'

export const productSearchSchema = z.object({
  page: pageParam,
  q: optionalText,
  status: optionalEnum(PRODUCT_STATUSES),
  categoryId: z.uuid().optional().catch(undefined),
  sort: z.enum(PRODUCT_SORTS).default('createdAt').catch('createdAt'),
  direction: z.enum(['asc', 'desc']).default('desc').catch('desc'),
})

export type ProductSearch = z.infer<typeof productSearchSchema>
