import type { ReactNode } from 'react'
import { Link, type LinkProps } from '@tanstack/react-router'
import { cn } from '@/lib/utils'

const count = new Intl.NumberFormat('vi-VN')

export interface RankedRow {
  key: string
  label: string
  /** Full text on hover, e.g. the path. */
  hint?: string
  value: number
  /** Secondary figures shown under the bar, e.g. "4 đơn · 3.3%". */
  meta?: ReactNode
  /** Makes the row a link (highlighted on hover/focus). */
  link?: Pick<LinkProps, 'to' | 'params'>
}

/**
 * Ranked single-hue bar list. Bars are relative to the top row; the number is the real count.
 * Linked rows change colour on hover/focus so it is obvious they can be opened.
 */
export function RankedList({ title, rows, empty = 'Chưa có dữ liệu', unit }: { title: string; rows: RankedRow[]; empty?: string; unit?: string }) {
  const top = Math.max(...rows.map((row) => row.value), 1)
  return (
    <div className="grid content-start gap-2">
      <h3 className="text-sm font-semibold">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ol className="grid gap-1">
          {rows.map((row, index) => {
            const body = (
              <>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="flex min-w-0 items-baseline gap-2">
                    <span className="w-5 shrink-0 text-xs text-muted-foreground tabular-nums">{index + 1}</span>
                    <span className="min-w-0 truncate" title={row.hint ?? row.label}>
                      {row.label}
                    </span>
                  </span>
                  <span className="shrink-0 tabular-nums text-muted-foreground">
                    {count.format(row.value)}
                    {unit ? ` ${unit}` : ''}
                  </span>
                </div>
                <div className="ml-7 h-1.5 rounded-full bg-muted">
                  <div className="h-1.5 rounded-full transition-colors" style={{ width: `${(row.value / top) * 100}%`, background: 'var(--viz-series-1)' }} />
                </div>
                {row.meta ? <div className="ml-7 text-xs text-muted-foreground">{row.meta}</div> : null}
              </>
            )
            const rowClass = 'grid gap-1 rounded-md px-2 py-1.5 text-sm'
            return (
              <li key={row.key}>
                {row.link ? (
                  <Link
                    {...(row.link as LinkProps)}
                    className={cn(rowClass, 'transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:outline-none')}
                  >
                    {body}
                  </Link>
                ) : (
                  <div className={cn(rowClass, 'transition-colors hover:bg-muted/60')}>{body}</div>
                )}
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
