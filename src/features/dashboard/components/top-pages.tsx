import { useState } from 'react'
import { cn } from '@/lib/utils'
import { groupTotal, PAGE_GROUP_LABELS, type PageGroup, type PageRow } from '../page-groups'
import { RankedList } from './ranked-list'

const count = new Intl.NumberFormat('vi-VN')
const FILTERS: Array<PageGroup | 'ALL'> = ['ALL', 'HOME', 'BLOG', 'PRODUCT', 'OTHER']
const VISIBLE_ROWS = 15

/** Viewed pages grouped into home, blog and product pages; Japanese and English visits are merged. */
export function TopPages({ rows, title = 'Trang được xem nhiều', unit, empty }: { rows: PageRow[]; title?: string; unit?: string; empty?: string }) {
  const [filter, setFilter] = useState<PageGroup | 'ALL'>('ALL')
  const [expanded, setExpanded] = useState(false)
  const filtered = filter === 'ALL' ? rows : rows.filter((row) => row.group === filter)
  const visible = expanded ? filtered : filtered.slice(0, VISIBLE_ROWS)

  return (
    <div className="grid content-start gap-3">
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Lọc theo loại trang">
        {FILTERS.map((value) => {
          const total = value === 'ALL' ? rows.reduce((sum, row) => sum + row.visitors, 0) : groupTotal(rows, value)
          return (
            <button
              key={value}
              type="button"
              aria-pressed={filter === value}
              onClick={() => {
                setFilter(value)
                setExpanded(false)
              }}
              className={cn(
                'rounded-full border px-3 py-1 text-xs transition-colors hover:bg-accent',
                filter === value && 'border-primary bg-primary text-primary-foreground hover:bg-primary',
              )}
            >
              {value === 'ALL' ? 'Tất cả' : PAGE_GROUP_LABELS[value]} · {count.format(total)}
            </button>
          )
        })}
      </div>
      <RankedList
        title={title}
        unit={unit}
        empty={empty}
        rows={visible.map((row) => ({
          key: row.path,
          label: row.title,
          hint: row.path,
          value: row.visitors,
          meta: filter === 'ALL' ? `${PAGE_GROUP_LABELS[row.group]} · ${row.path}` : row.path,
        }))}
      />
      {filtered.length > VISIBLE_ROWS ? (
        <button type="button" className="justify-self-start text-sm text-primary hover:underline" onClick={() => setExpanded((value) => !value)}>
          {expanded ? 'Thu gọn' : `Xem tất cả ${filtered.length} trang`}
        </button>
      ) : null}
    </div>
  )
}
