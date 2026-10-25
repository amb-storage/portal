import { z } from 'zod'
import { optionalEnum, optionalText, pageParam } from '@/lib/search'
import { FULFILLMENT_STATUSES, ORDER_STATUSES } from './types'

export const orderSearchSchema = z.object({
  page: pageParam,
  q: optionalText,
  status: optionalEnum(ORDER_STATUSES),
  fulfillmentStatus: optionalEnum(FULFILLMENT_STATUSES),
})

export type OrderSearch = z.infer<typeof orderSearchSchema>
