import type { RichNode } from './types'

/** Brand colors the API accepts for the textColor mark. */
export const TEXT_COLORS = [
  { value: 'GREEN', label: 'Xanh lá', css: '#2C5F34' },
  { value: 'RED', label: 'Đỏ', css: '#b3261e' },
  { value: 'BLUE', label: 'Xanh dương', css: '#1f4e8c' },
  { value: 'GRAY', label: 'Xám', css: '#6a7282' },
] as const
export type TextColor = (typeof TEXT_COLORS)[number]['value']
export const textColorCss = (color: unknown) => TEXT_COLORS.find((item) => item.value === color)?.css

const CONTAINERS = new Set(['doc', 'paragraph', 'bulletList', 'orderedList', 'listItem', 'blockquote', 'heading'])

/** Same typography as richTextClassName in amb-storage-web's CmsSections. */
export const WEBSITE_RICH_TEXT =
  'text-[15px] tracking-[0.1em] [&_a]:text-[#2C5F34] [&_a]:underline [&_h1]:mb-4 [&_h1]:mt-2 [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:leading-tight [&_h1]:text-[#2C5F34] md:[&_h1]:text-4xl [&_h2]:mb-4 [&_h2]:mt-2 [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:leading-tight [&_h2]:text-[#2C5F34] md:[&_h2]:text-4xl [&_h3]:mb-3 [&_h3]:mt-2 [&_h3]:text-2xl [&_h3]:font-bold [&_h3]:text-[#2C5F34] md:[&_h3]:text-[1.75rem] [&_p]:mb-1.5 [&_p]:leading-[1.45] [&_p]:text-gray-900 [&_li]:mb-2 [&_li_p]:mb-0 [&_ul]:mb-1.5 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-1.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:font-semibold [&_strong]:text-gray-900 [&_blockquote]:border-l-2 [&_blockquote]:border-[#2C5F34] [&_blockquote]:pl-4'

export const emptyRichText = (): RichNode => ({ type: 'doc', content: [{ type: 'paragraph', content: [] }] })

/**
 * Reduces editor JSON to exactly what the API's rich-text validator accepts:
 * containers always carry `content`, only heading keeps attrs (level 1–3),
 * links keep only `href`, and unknown nodes/marks are dropped.
 */
export function normalizeRichText(node: RichNode): RichNode | null {
  if (node.type === 'text') {
    if (!node.text) return null
    const marks = (node.marks ?? []).flatMap((mark) => {
      if (mark.type === 'bold' || mark.type === 'italic') return [{ type: mark.type }]
      if (mark.type === 'link' && typeof mark.attrs?.href === 'string') return [{ type: 'link', attrs: { href: mark.attrs.href } }]
      if (mark.type === 'textColor' && textColorCss(mark.attrs?.color)) return [{ type: 'textColor', attrs: { color: mark.attrs!.color } }]
      return []
    })
    return marks.length ? { type: 'text', text: node.text, marks } : { type: 'text', text: node.text }
  }
  if (node.type === 'hardBreak') return { type: 'hardBreak' }
  if (!CONTAINERS.has(node.type)) return null
  const content = (node.content ?? []).map(normalizeRichText).filter((child): child is RichNode => child !== null)
  if (node.type === 'heading') {
    const level = Math.min(Math.max(Number(node.attrs?.level) || 2, 1), 3)
    return { type: 'heading', attrs: { level }, content }
  }
  return { type: node.type, content }
}

export function isRichText(value: unknown): value is RichNode {
  return typeof value === 'object' && value !== null && (value as RichNode).type === 'doc'
}

export function hasText(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const rich = node as RichNode
  if (typeof rich.text === 'string' && rich.text.trim()) return true
  return (rich.content ?? []).some(hasText)
}

/** Same rule as the API's isSafeLink: site-relative path or https URL. */
export function isSafeLink(value: unknown): value is string {
  if (typeof value !== 'string' || [...value].some((character) => character.charCodeAt(0) < 32 || character === '\\')) return false
  if (value.startsWith('/') && !value.startsWith('//')) return true
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && Boolean(url.hostname)
  } catch {
    return false
  }
}
