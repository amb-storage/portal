import type { AnalyticsData, FirstPartyViews } from './types'

export type PageGroup = 'HOME' | 'BLOG' | 'PRODUCT' | 'OTHER'

export const PAGE_GROUP_LABELS: Record<PageGroup, string> = {
  HOME: 'Trang chủ',
  BLOG: 'Blog',
  PRODUCT: 'Sản phẩm',
  OTHER: 'Trang khác',
}

export interface PageRow {
  path: string
  title: string
  group: PageGroup
  visitors: number
}

// The website serves Japanese without a prefix and English under /en.
const withoutLocale = (path: string) => path.replace(/^\/en(?=\/|$)/, '') || '/'

// Fixed pages have no CMS title; name them so the list reads like the website menu.
const FIXED_TITLES: Record<string, string> = {
  '/': 'Trang chủ',
  '/shop': 'Shop (tất cả sản phẩm)',
  '/blog': 'Mili Talks (danh sách bài)',
  '/contact': 'Liên hệ',
  '/customer-voice': 'Customer Voice',
  '/cart': 'Giỏ hàng',
}

function groupOf(path: string): PageGroup {
  if (path === '/') return 'HOME'
  if (path === '/blog' || path.startsWith('/blog/')) return 'BLOG'
  if (path.startsWith('/shop/')) return 'PRODUCT'
  return 'OTHER'
}

/** Merges the Japanese and English rows of the same page and sorts by visitors. */
export function toPageRows(pages: AnalyticsData['topPages']): PageRow[] {
  const rows = new Map<string, PageRow>()
  for (const page of pages) {
    const path = withoutLocale(page.path.split(/[?#]/)[0])
    const group = groupOf(path)
    const row = rows.get(path)
    if (row) {
      row.visitors += page.visitors
      continue
    }
    const title = FIXED_TITLES[path] ?? (page.title?.trim() || path)
    rows.set(path, { path, title, group, visitors: page.visitors })
  }
  return [...rows.values()].sort((a, b) => b.visitors - a.visitors)
}

export const groupTotal = (rows: PageRow[], group: PageGroup) =>
  rows.filter((row) => row.group === group).reduce((sum, row) => sum + row.visitors, 0)

/** Rows counted by the API itself; paths are already locale-free and merged. */
export function firstPartyPageRows(pages: NonNullable<FirstPartyViews['topPages']>): PageRow[] {
  return pages.map((page) => ({
    path: page.path,
    title: FIXED_TITLES[page.path] ?? (page.titleJa || page.titleEn || page.path),
    group: page.kind === 'PAGE' ? groupOf(page.path) : page.kind,
    visitors: page.views,
  }))
}
