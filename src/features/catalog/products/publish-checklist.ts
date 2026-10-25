import type { Product } from './types'

/** Where the Admin fixes a missing item: a General-tab field id or the Media tab. */
export type ChecklistTarget = { tab: 'general'; field: string } | { tab: 'media' }

export interface ChecklistItem {
  key: string
  label: string
  done: boolean
  target: ChecklistTarget
}

const hasText = (value: string | null | undefined) => typeof value === 'string' && value.trim().length > 0

/**
 * Mirrors productPublicationErrors on the API. The publish error response
 * does not carry the failing rules, so the portal evaluates them itself.
 */
export function publishChecklist(product: Product): ChecklistItem[] {
  const field = (name: string): ChecklistTarget => ({ tab: 'general', field: name })
  return [
    { key: 'nameJa', label: 'Tên tiếng Nhật', done: hasText(product.nameJa), target: field('nameJa') },
    { key: 'nameEn', label: 'Tên tiếng Anh', done: hasText(product.nameEn), target: field('nameEn') },
    { key: 'slug', label: 'Slug (đường dẫn)', done: hasText(product.slug), target: field('slug') },
    { key: 'price', label: 'Giá bán', done: product.price !== null && product.price > 0, target: field('price') },
    { key: 'size', label: 'Size', done: hasText(product.size), target: field('size') },
    { key: 'descriptionJa', label: 'Mô tả tiếng Nhật', done: hasText(product.descriptionJa), target: field('descriptionJa') },
    { key: 'descriptionEn', label: 'Mô tả tiếng Anh', done: hasText(product.descriptionEn), target: field('descriptionEn') },
    { key: 'category', label: 'Ít nhất 1 danh mục', done: product.categories.length > 0, target: field('categoryIds') },
    {
      key: 'media',
      label: 'Ít nhất 1 ảnh sẵn sàng',
      done: product.media.some((media) => media.status === 'READY'),
      target: { tab: 'media' },
    },
  ]
}
