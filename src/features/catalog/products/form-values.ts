import type { Product, ProductDetailEntry } from './types'

export interface ProductFormValues {
  slug: string
  nameJa: string
  nameEn: string
  price?: number
  size: string
  /** Initial stock; only sent on create. */
  quantity?: number
  descriptionJa: string
  descriptionEn: string
  conditionJa: string
  conditionEn: string
  seoTitleJa: string
  seoTitleEn: string
  seoDescriptionJa: string
  seoDescriptionEn: string
  categoryIds: string[]
  details: ProductDetailEntry[]
  /** Related Mili Talks article (Story id); '' = none. */
  miliTalkId: string
}

const TEXT_FIELDS = [
  'slug', 'nameJa', 'nameEn', 'size', 'descriptionJa', 'descriptionEn', 'conditionJa', 'conditionEn',
  'seoTitleJa', 'seoTitleEn', 'seoDescriptionJa', 'seoDescriptionEn',
] as const
const ARRAY_FIELDS = ['categoryIds', 'details'] as const

export function toFormValues(product?: Product): ProductFormValues {
  return {
    slug: product?.slug ?? '',
    nameJa: product?.nameJa ?? '',
    nameEn: product?.nameEn ?? '',
    price: product?.price ?? undefined,
    size: product?.size ?? '',
    quantity: product ? (product.quantity ?? undefined) : 1,
    descriptionJa: product?.descriptionJa ?? '',
    descriptionEn: product?.descriptionEn ?? '',
    conditionJa: product?.conditionJa ?? '',
    conditionEn: product?.conditionEn ?? '',
    seoTitleJa: product?.seoTitleJa ?? '',
    seoTitleEn: product?.seoTitleEn ?? '',
    seoDescriptionJa: product?.seoDescriptionJa ?? '',
    seoDescriptionEn: product?.seoDescriptionEn ?? '',
    categoryIds: product?.categories.map((item) => item.id) ?? [],
    details: product?.details ?? [],
    miliTalkId: product?.miliTalkId ?? '',
  }
}

/** Create: drafts may be incomplete, so empty optionals are omitted. */
export function toCreatePayload(values: ProductFormValues): Record<string, unknown> {
  const payload: Record<string, unknown> = {}
  for (const key of TEXT_FIELDS) if (values[key].trim()) payload[key] = values[key]
  for (const key of ARRAY_FIELDS) if (values[key].length > 0) payload[key] = values[key]
  if (values.price !== undefined) payload.price = values.price
  if (values.quantity !== undefined) payload.quantity = values.quantity
  if (values.miliTalkId) payload.miliTalkId = values.miliTalkId
  return payload
}

/**
 * Update: send only changed fields, because omitted and explicit null have
 * different semantics on ProductUpdateDto. Cleared fields become null.
 * Quantity is never sent; stock changes go through stock adjustments.
 */
export function toUpdatePayload(values: ProductFormValues, initial: ProductFormValues): Record<string, unknown> {
  const payload: Record<string, unknown> = {}
  for (const key of TEXT_FIELDS) {
    if (values[key] !== initial[key]) payload[key] = values[key].trim() ? values[key] : null
  }
  if (values.price !== initial.price) payload.price = values.price ?? null
  for (const key of ARRAY_FIELDS) {
    if (JSON.stringify(values[key]) !== JSON.stringify(initial[key])) payload[key] = values[key]
  }
  // Clearing the selection sends null, which removes the link.
  if (values.miliTalkId !== initial.miliTalkId) payload.miliTalkId = values.miliTalkId || null
  return payload
}
