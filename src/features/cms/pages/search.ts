import { z } from 'zod'
import { optionalEnum, optionalText, pageParam } from '@/lib/search'
import { PAGE_STATUSES, PAGE_TYPES } from './types'

export const cmsPageSearchSchema = z.object({
  page: pageParam,
  q: optionalText,
  type: optionalEnum(PAGE_TYPES),
  status: optionalEnum(PAGE_STATUSES),
})

export type CmsPageSearch = z.infer<typeof cmsPageSearchSchema>

export const CMS_DETAIL_TABS = ['draft', 'versions', 'settings', 'registry'] as const
export type CmsDetailTab = (typeof CMS_DETAIL_TABS)[number]

export const cmsPageDetailSearchSchema = z.object({
  tab: z.enum(CMS_DETAIL_TABS).default('draft').catch('draft'),
})
