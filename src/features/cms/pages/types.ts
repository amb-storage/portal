import type { BlockDef, SectionDef } from '@/features/cms/editor/types'
import type { ISODate } from '@/lib/api/types'

export const PAGE_TYPES = ['HOME', 'STANDARD', 'ABOUT', 'POLICY', 'LANDING'] as const
export const PAGE_STATUSES = ['ACTIVE', 'ARCHIVED'] as const
export type PageType = (typeof PAGE_TYPES)[number]
export type PageStatus = (typeof PAGE_STATUSES)[number]
export type VersionStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'

/** List rows are raw SQL (snake_case) joined with current draft/published. */
export interface PageListRow {
  id: string
  slug: string
  type: PageType
  status: PageStatus
  published_version_id: string | null
  first_published_at: ISODate | null
  created_at: ISODate
  updated_at: ISODate
  draft_id: string | null
  draft_version: number | null
  draft_revision: number | null
  published_id: string | null
  published_version: number | null
  published_at: ISODate | null
}

export interface VersionSummaryRow {
  id: string
  version: number
  status: VersionStatus
  revision: number
  source_version_id: string | null
  title_ja?: string | null
  title_en?: string | null
  effective_at: ISODate | null
  created_at: ISODate
  updated_at: ISODate
  published_at: ISODate | null
}

export interface CmsPage {
  id: string
  slug: string
  type: PageType
  status: PageStatus
  publishedVersionId: string | null
  firstPublishedAt: ISODate | null
  createdAt: ISODate
  updatedAt: ISODate
  versions: VersionSummaryRow[]
}

export interface CmsDocument {
  schemaVersion: number
  sections: Array<Record<string, unknown>>
  [key: string]: unknown
}

export interface PageVersion {
  id: string
  pageId: string
  version: number
  status: VersionStatus
  revision: number
  sourceVersionId: string | null
  titleJa: string | null
  titleEn: string | null
  seoTitleJa: string | null
  seoTitleEn: string | null
  seoDescriptionJa: string | null
  seoDescriptionEn: string | null
  content?: CmsDocument | Record<string, unknown>
  effectiveAt: ISODate | null
  createdAt: ISODate
  updatedAt: ISODate
  publishedAt: ISODate | null
}

export interface FixedContent {
  pageId: string
  pageType: 'ABOUT' | 'POLICY'
  draftVersionId: string
  expectedRevision: number
  titleJa: string | null
  titleEn: string | null
  bodyJa: Record<string, unknown> | null
  bodyEn: Record<string, unknown> | null
  content: Record<string, unknown> | null
  seoTitleJa: string | null
  seoTitleEn: string | null
  seoDescriptionJa: string | null
  seoDescriptionEn: string | null
  effectiveAt: ISODate | null
}

export interface PreviewToken {
  token: string
  draftVersionId: string
  expiresInSeconds: number
}

export interface SectionRegistry {
  documentSchemaVersion: number
  sections: SectionDef[]
  blocks: BlockDef[]
}
