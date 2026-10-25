import type { RichNode } from './types'

const CONTAINERS = new Set(['doc', 'paragraph', 'bulletList', 'orderedList', 'listItem', 'blockquote', 'heading'])

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
