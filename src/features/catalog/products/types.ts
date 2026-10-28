import type { ISODate } from '@/lib/api/types'

export type ProductStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
/** ProductListQueryDto only filters DRAFT | PUBLISHED. */
export const PRODUCT_STATUSES = ['DRAFT', 'PUBLISHED'] as const
export const PRODUCT_SORTS = ['createdAt', 'updatedAt', 'publishedAt', 'name'] as const

export interface ProductDetailEntry {
  key: string
  labelJa: string
  labelEn: string
  valueJa: string
  valueEn: string
}

/** List rows are returned raw from SQL (snake_case). Drafts may have null fields. */
export interface ProductSummary {
  id: string
  slug: string | null
  name_ja: string | null
  name_en: string | null
  /** Positive integer JPY amount. */
  price: number | null
  size: string | null
  quantity: number | null
  status: ProductStatus
  published_at: ISODate | null
  created_at: ISODate
  updated_at: ISODate
}

/** Joined rows are returned raw from SQL (snake_case). */
export interface ProductMediaRow {
  id: string
  original_filename: string | null
  mime_type: string
  size_bytes: number | null
  width: number | null
  height: number | null
  status: string
  alt_ja: string | null
  alt_en: string | null
  position: number
}

export interface ProductCategoryRow {
  id: string
  slug: string
  name_ja: string
  name_en: string
  position: number
}

export interface Product {
  id: string
  slug: string | null
  nameJa: string | null
  nameEn: string | null
  descriptionJa: string | null
  descriptionEn: string | null
  conditionJa: string | null
  conditionEn: string | null
  price: number | null
  size: string | null
  /** Authoritative physical quantity; changed only via stock adjustments. */
  quantity: number | null
  details: ProductDetailEntry[] | null
  status: ProductStatus
  publishedAt: ISODate | null
  /** Accepted on write; not currently echoed by the detail response. */
  seoTitleJa?: string | null
  seoTitleEn?: string | null
  seoDescriptionJa?: string | null
  seoDescriptionEn?: string | null
  categories: ProductCategoryRow[]
  media: ProductMediaRow[]
  /** Linked Mili Talks article (Story id); absent on API builds before the link existed. */
  miliTalkId?: string | null
}

export interface ProductListQuery {
  page: number
  limit: number
  q?: string
  status?: (typeof PRODUCT_STATUSES)[number]
  categoryId?: string
  size?: string
  minPrice?: number
  maxPrice?: number
  sort?: (typeof PRODUCT_SORTS)[number]
  direction?: 'asc' | 'desc'
}

export interface StockAdjustmentInput {
  /** Non-zero integer; the result may not drop below active Checkout reservations. */
  delta: number
  reason: string
}
