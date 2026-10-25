import type { ISODate } from '@/lib/api/types'

export const STORY_STATUSES = ['DRAFT', 'PUBLISHED'] as const

/** Story is the sole content domain; "Mili Talk(s)" is only the Web display label. */
export interface Story {
  id: string
  pageId: string
  slug: string
  pageStatus: 'ACTIVE' | 'ARCHIVED'
  publicationStatus: 'DRAFT' | 'PUBLISHED'
  draft: { id: string; revision: number; titleJa: string | null; titleEn: string | null } | null
  published: { id: string; titleJa: string | null; titleEn: string | null; publishedAt: ISODate | null; slug: string } | null
  createdAt: ISODate
  updatedAt: ISODate
}

export interface StoryListQuery {
  page: number
  limit: number
  q?: string
  status?: (typeof STORY_STATUSES)[number]
}
