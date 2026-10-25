import { z } from 'zod'
import { pageParam } from '@/lib/search'

export const categorySearchSchema = z.object({ page: pageParam })

export type CategorySearch = z.infer<typeof categorySearchSchema>
