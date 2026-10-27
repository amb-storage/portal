import type { ISODate } from '@/lib/api/types'

export const STORY_STATUSES = ['UNPUBLISHED', 'PUBLISHED'] as const
export type StoryStatus = (typeof STORY_STATUSES)[number]

/** Story is the canonical backend resource; "Mili Talk(s)" is only the Web display label. */
export interface Story {
  id: string
  pageId: string
  slug: string
  pageStatus: 'ACTIVE' | 'ARCHIVED'
  status: StoryStatus
  /** From the working draft when there is one, otherwise the published version. */
  titleJa: string | null
  titleEn: string | null
  publishedAt: ISODate | null
  createdAt: ISODate
  updatedAt: ISODate
}

export interface StoryDetail extends Story {
  seoTitleJa: string | null
  seoTitleEn: string | null
  seoDescriptionJa: string | null
  seoDescriptionEn: string | null
  content: Record<string, unknown> | null
}

/** Body of POST /stories and PATCH /stories/:id; omitted fields stay unchanged. */
export interface StoryWrite {
  slug?: string
  titleJa?: string | null
  titleEn?: string | null
  seoTitleJa?: string | null
  seoTitleEn?: string | null
  seoDescriptionJa?: string | null
  seoDescriptionEn?: string | null
  content?: Record<string, unknown>
}

export interface StoryListQuery {
  page: number
  limit: number
  q?: string
  status?: StoryStatus
}

export const storyTitle = (story: Pick<Story, 'titleJa' | 'titleEn' | 'slug'>) => story.titleJa || story.titleEn || story.slug
