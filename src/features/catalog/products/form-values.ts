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
  /** Other spec rows; the pasted measurements block lives in measurementsJa/En. */
  details: ProductDetailEntry[]
  /** Measurements pasted as one block (kept line breaks), stored as the `measurements` detail row. */
  measurementsJa: string
  measurementsEn: string
  /** Related Mili Talks article (Story id); '' = none. */
  miliTalkId: string
}

const TEXT_FIELDS = [
  'slug', 'nameJa', 'nameEn', 'size', 'descriptionJa', 'descriptionEn', 'conditionJa', 'conditionEn',
  'seoTitleJa', 'seoTitleEn', 'seoDescriptionJa', 'seoDescriptionEn',
] as const
const ARRAY_FIELDS = ['categoryIds'] as const

/** Detail key of the pasted measurements block; the Web shows its value as-is (line breaks kept). */
export const MEASUREMENTS_KEY = 'measurements'

/** API details = measurements block (if any) + the other rows. */
function detailsPayload(values: ProductFormValues): ProductDetailEntry[] {
  const ja = values.measurementsJa.trim()
  const en = values.measurementsEn.trim()
  const block: ProductDetailEntry[] =
    ja || en ? [{ key: MEASUREMENTS_KEY, labelJa: 'サイズ', labelEn: 'Measurements', valueJa: ja || en, valueEn: en || ja }] : []
  return [...block, ...values.details]
}

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
    details: (product?.details ?? []).filter((detail) => detail.key !== MEASUREMENTS_KEY),
    measurementsJa: product?.details?.find((detail) => detail.key === MEASUREMENTS_KEY)?.valueJa ?? '',
    measurementsEn: product?.details?.find((detail) => detail.key === MEASUREMENTS_KEY)?.valueEn ?? '',
    miliTalkId: product?.miliTalkId ?? '',
  }
}

/** Create: drafts may be incomplete, so empty optionals are omitted. */
export function toCreatePayload(values: ProductFormValues): Record<string, unknown> {
  const payload: Record<string, unknown> = {}
  for (const key of TEXT_FIELDS) if (values[key].trim()) payload[key] = values[key]
  for (const key of ARRAY_FIELDS) if (values[key].length > 0) payload[key] = values[key]
  const details = detailsPayload(values)
  if (details.length > 0) payload.details = details
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
  const details = detailsPayload(values)
  if (JSON.stringify(details) !== JSON.stringify(detailsPayload(initial))) payload.details = details
  // Clearing the selection sends null, which removes the link.
  if (values.miliTalkId !== initial.miliTalkId) payload.miliTalkId = values.miliTalkId || null
  return payload
}
