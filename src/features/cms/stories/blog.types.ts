import type { ISODate } from '@/lib/api/types'

export interface BlogPostSummary {
  id: string
  slug: string
  pageStatus: 'ACTIVE' | 'ARCHIVED'
  publicationStatus: 'DRAFT' | 'PUBLISHED'
  draft: { id: string; revision: number; titleJa: string | null; titleEn: string | null } | null
  published: { id: string; titleJa: string | null; titleEn: string | null; publishedAt: ISODate | null; slug: string } | null
  createdAt: ISODate
  updatedAt: ISODate
}

export interface BlogPostDraft {
  id: string
  version: number
  status: 'DRAFT'
  revision: number
  sourceVersionId: string | null
  titleJa: string | null
  titleEn: string | null
  seoTitleJa: string | null
  seoTitleEn: string | null
  seoDescriptionJa: string | null
  seoDescriptionEn: string | null
  content: Record<string, unknown>
  effectiveAt: ISODate | null
  createdAt: ISODate
  updatedAt: ISODate
  publishedAt: ISODate | null
}

export interface BlogPostDetail extends BlogPostSummary {
  draft: BlogPostDraft | null
}

export interface BlogPreview {
  post: BlogPostSummary
  draft: BlogPostDraft
  expiresInSeconds: number
}

export interface BlogPostListQuery {
  page: number
  limit: number
  q?: string
  status?: 'DRAFT' | 'PUBLISHED'
}
