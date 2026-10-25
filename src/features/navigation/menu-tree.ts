import type { MenuItemValues } from './types'

/** Mirrors navigation.policy.ts: a path may hold at most 3 items. */
export const MAX_MENU_DEPTH = 3

export interface TreeRow {
  item: MenuItemValues
  /** Index in the flat form array (what form fields are bound to). */
  index: number
  /** 1 = top level. */
  depth: number
  siblingIndex: number
  siblingCount: number
  childCount: number
}

/**
 * The form keeps a flat array; sibling order is array order within a parent
 * (toMenuPayload derives `position` the same way). Items pointing at a missing
 * parent are shown at the top level.
 */
export function buildTree(items: MenuItemValues[]): TreeRow[] {
  const ids = new Set(items.map((item) => item.id))
  const parentOf = (item: MenuItemValues) => (item.parentId && ids.has(item.parentId) ? item.parentId : '')
  const children = new Map<string, number[]>()
  items.forEach((item, index) => {
    const key = parentOf(item)
    children.set(key, [...(children.get(key) ?? []), index])
  })
  const rows: TreeRow[] = []
  const visit = (parentId: string, depth: number, seen: Set<string>) => {
    const siblings = children.get(parentId) ?? []
    siblings.forEach((index, siblingIndex) => {
      const item = items[index]
      if (seen.has(item.id)) return
      rows.push({ item, index, depth, siblingIndex, siblingCount: siblings.length, childCount: children.get(item.id)?.length ?? 0 })
      visit(item.id, depth + 1, new Set(seen).add(item.id))
    })
  }
  visit('', 1, new Set())
  return rows
}

function descendants(items: MenuItemValues[], id: string): Set<string> {
  const result = new Set<string>()
  const walk = (parentId: string) =>
    items.filter((item) => item.parentId === parentId).forEach((item) => {
      if (result.has(item.id)) return
      result.add(item.id)
      walk(item.id)
    })
  walk(id)
  return result
}

/** Levels below an item, counting itself (leaf = 1). */
export function subtreeHeight(items: MenuItemValues[], id: string): number {
  const kids = items.filter((item) => item.parentId === id)
  return 1 + Math.max(0, ...kids.map((kid) => subtreeHeight(items, kid.id)))
}

const siblingsOf = (items: MenuItemValues[], parentId: string) => items.map((item, index) => ({ item, index })).filter(({ item }) => item.parentId === parentId)

/** Swap with the previous (-1) or next (+1) sibling. */
export function moveAmongSiblings(items: MenuItemValues[], index: number, delta: -1 | 1) {
  const siblings = siblingsOf(items, items[index].parentId)
  const position = siblings.findIndex((entry) => entry.index === index)
  const target = siblings[position + delta]
  if (!target) return items
  const next = [...items]
  ;[next[index], next[target.index]] = [next[target.index], next[index]]
  return next
}

/** Become the last child of the previous sibling. */
export function indent(items: MenuItemValues[], index: number, depth: number) {
  const siblings = siblingsOf(items, items[index].parentId)
  const position = siblings.findIndex((entry) => entry.index === index)
  const previous = siblings[position - 1]
  if (!previous || depth + subtreeHeight(items, items[index].id) > MAX_MENU_DEPTH) return items
  const moved = { ...items[index], parentId: previous.item.id }
  return [...items.filter((_, other) => other !== index), moved]
}

/** Move up one level, placed right after the former parent. */
export function outdent(items: MenuItemValues[], index: number) {
  const parent = items.find((item) => item.id === items[index].parentId)
  if (!parent) return items
  const moved = { ...items[index], parentId: parent.parentId }
  const rest = items.filter((_, other) => other !== index)
  const parentIndex = rest.findIndex((item) => item.id === parent.id)
  return [...rest.slice(0, parentIndex + 1), moved, ...rest.slice(parentIndex + 1)]
}

/** Removes the item together with everything nested under it. */
export function removeWithChildren(items: MenuItemValues[], index: number) {
  const doomed = descendants(items, items[index].id).add(items[index].id)
  return items.filter((item) => !doomed.has(item.id))
}

export function isIncomplete(item: MenuItemValues) {
  if (!item.labelJa.trim() || !item.labelEn.trim()) return true
  return item.destinationType === 'PAGE' ? !item.pageId : !item.destination.trim()
}

export function canIndent(row: TreeRow, items: MenuItemValues[]) {
  return row.siblingIndex > 0 && row.depth + subtreeHeight(items, row.item.id) <= MAX_MENU_DEPTH
}
