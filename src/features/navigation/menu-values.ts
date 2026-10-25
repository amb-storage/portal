import type { MenuFormValues, MenuItemValues, NavigationItem, NavigationMenu } from './types'

/** Items arrive ordered by parent then position; keep that order in the form. */
export function toMenuValues(menu: NavigationMenu): MenuFormValues {
  return {
    items: menu.items.map((item) => ({
      id: item.id,
      parentId: item.parentId ?? '',
      labelJa: item.labelJa,
      labelEn: item.labelEn,
      destinationType: item.destinationType,
      pageId: item.pageId ?? '',
      destination: item.destination ?? '',
      enabled: item.enabled,
    })),
  }
}

export function newMenuItem(): MenuItemValues {
  return {
    id: crypto.randomUUID(),
    parentId: '',
    labelJa: '',
    labelEn: '',
    destinationType: 'PATH',
    pageId: '',
    destination: '/',
    enabled: true,
  }
}

/**
 * NavigationReplaceDto: PAGE items carry only pageId, all others only destination.
 * Position is the item's index among its siblings.
 */
export function toMenuPayload(values: MenuFormValues): NavigationItem[] {
  const counters = new Map<string, number>()
  return values.items.map((item) => {
    const position = counters.get(item.parentId) ?? 0
    counters.set(item.parentId, position + 1)
    const isPage = item.destinationType === 'PAGE'
    return {
      id: item.id,
      parentId: item.parentId || null,
      labelJa: item.labelJa,
      labelEn: item.labelEn,
      destinationType: item.destinationType,
      pageId: isPage ? item.pageId || null : null,
      destination: isPage ? null : item.destination.trim(),
      enabled: item.enabled,
      position,
    }
  })
}

export const DESTINATION_HINTS: Record<string, string> = {
  CATEGORY: 'Slug danh mục, vd. outerwear',
  PRODUCT: 'Slug sản phẩm',
  MILI_TALK: 'Slug bài viết',
  PATH: 'Đường dẫn nội bộ, vd. /about',
  EXTERNAL_URL: 'Đường dẫn HTTPS',
}
