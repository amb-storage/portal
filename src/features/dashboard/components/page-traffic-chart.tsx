import { useState } from 'react'
import { useElementWidth } from '@/hooks/use-element-width'
import type { FirstPartyViews } from '../types'

const HEIGHT = 240
const PAD = { top: 12, right: 96, bottom: 24, left: 48 }
const LABEL_GAP = 14

const count = new Intl.NumberFormat('vi-VN')
const shortDate = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', timeZone: 'UTC' })
const longDate = new Intl.DateTimeFormat('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit', timeZone: 'UTC' })

type Day = NonNullable<FirstPartyViews['pageTraffic']>[number]
type SeriesKey = 'home' | 'product' | 'blog' | 'other'

/** Fixed slot per group so a colour always means the same group (validated light and dark). */
const SERIES: Array<{ key: SeriesKey; label: string; color: string }> = [
  { key: 'home', label: 'Trang chủ', color: 'var(--viz-series-1)' },
  { key: 'product', label: 'Sản phẩm', color: 'var(--viz-series-2)' },
  { key: 'blog', label: 'Blog', color: 'var(--viz-series-3)' },
  { key: 'other', label: 'Trang khác', color: 'var(--viz-series-4)' },
]

function niceMax(value: number) {
  if (value <= 0) return 1
  const step = 10 ** Math.floor(Math.log10(value))
  return [1, 2, 5, 10].map((m) => m * step).find((candidate) => candidate >= value) ?? value
}

/** Pushes end labels apart so they never overlap; keeps them inside the plot height. */
function spreadLabels(ys: number[], min: number, max: number) {
  const order = ys.map((y, index) => ({ y, index })).sort((a, b) => a.y - b.y)
  for (let i = 1; i < order.length; i += 1) order[i].y = Math.max(order[i].y, order[i - 1].y + LABEL_GAP)
  const overflow = order.at(-1)!.y - max
  if (overflow > 0) for (const item of order) item.y = Math.max(item.y - overflow, min)
  const result: number[] = []
  for (const item of order) result[item.index] = item.y
  return result
}

/** Daily page views as one line per page group, with a crosshair tooltip and direct labels. */
export function PageTrafficChart({ days }: { days: Day[] }) {
  const { ref, width } = useElementWidth<HTMLDivElement>()
  const [active, setActive] = useState<number | null>(null)
  const max = niceMax(Math.max(0, ...days.flatMap((day) => SERIES.map((series) => day[series.key]))))
  const plotW = Math.max(width - PAD.left - PAD.right, 0)
  const plotH = HEIGHT - PAD.top - PAD.bottom
  const x = (index: number) => PAD.left + (days.length <= 1 ? plotW / 2 : (index / (days.length - 1)) * plotW)
  const y = (value: number) => PAD.top + plotH - (value / max) * plotH
  const labelEvery = Math.max(1, Math.ceil(days.length / 6))
  const last = days.at(-1)
  const totals = SERIES.map((series) => days.reduce((sum, day) => sum + day[series.key], 0))
  const endYs = last ? spreadLabels(SERIES.map((series) => y(last[series.key])), PAD.top, PAD.top + plotH) : []
  const hovered = active === null ? null : days[active]

  const pick = (clientX: number, element: HTMLElement) => {
    if (days.length === 0) return
    const left = clientX - element.getBoundingClientRect().left - PAD.left
    const index = days.length <= 1 ? 0 : Math.round((left / Math.max(plotW, 1)) * (days.length - 1))
    setActive(Math.min(Math.max(index, 0), days.length - 1))
  }

  return (
    <div className="grid gap-3">
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground" aria-label="Chú thích">
        {SERIES.map((series, index) => (
          <li key={series.key} className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 rounded-full" style={{ background: series.color }} aria-hidden />
            <span className="text-foreground">{series.label}</span>
            <span className="tabular-nums">{count.format(totals[index])}</span>
          </li>
        ))}
      </ul>
      <div ref={ref} className="relative" onPointerLeave={() => setActive(null)} onPointerMove={(event) => pick(event.clientX, event.currentTarget)}>
        {width > 0 ? (
          <svg
            width={width}
            height={HEIGHT}
            role="img"
            aria-label={`Lượt xem theo ngày: ${SERIES.map((series, index) => `${series.label} ${count.format(totals[index])}`).join(', ')}`}
          >
            {[0, 0.5, 1].map((ratio) => (
              <g key={ratio}>
                <line x1={PAD.left} x2={PAD.left + plotW} y1={y(max * ratio)} y2={y(max * ratio)} className="stroke-border" strokeDasharray={ratio === 0 ? undefined : '2 4'} />
                <text x={PAD.left - 8} y={y(max * ratio)} dy="0.32em" textAnchor="end" className="fill-muted-foreground text-[11px] tabular-nums">
                  {count.format(Math.round(max * ratio))}
                </text>
              </g>
            ))}
            {days.map((day, index) =>
              (days.length - 1 - index) % labelEvery === 0 ? (
                <text key={day.day} x={x(index)} y={HEIGHT - 6} textAnchor="middle" className="fill-muted-foreground text-[11px]">
                  {shortDate.format(new Date(`${day.day}T00:00:00Z`))}
                </text>
              ) : null,
            )}
            {active !== null ? <line x1={x(active)} x2={x(active)} y1={PAD.top} y2={PAD.top + plotH} className="stroke-muted-foreground" strokeWidth={1} /> : null}
            {SERIES.map((series) => (
              <polyline
                key={series.key}
                points={days.map((day, index) => `${x(index)},${y(day[series.key])}`).join(' ')}
                fill="none"
                stroke={series.color}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            ))}
            {active !== null && hovered
              ? SERIES.map((series) => (
                  <circle key={series.key} cx={x(active)} cy={y(hovered[series.key])} r={4} fill={series.color} className="stroke-card" strokeWidth={2} />
                ))
              : null}
            {last
              ? SERIES.map((series, index) => (
                  <text key={series.key} x={PAD.left + plotW + 8} y={endYs[index]} dy="0.32em" className="fill-foreground text-[11px]">
                    <tspan fill={series.color} aria-hidden>
                      ●{' '}
                    </tspan>
                    {series.label}
                  </text>
                ))
              : null}
          </svg>
        ) : (
          <div style={{ height: HEIGHT }} />
        )}
        {hovered && active !== null ? (
          <div
            className="pointer-events-none absolute top-0 z-10 grid min-w-36 -translate-x-1/2 gap-1 rounded-md border bg-popover px-3 py-2 text-xs shadow-md"
            style={{ left: Math.min(Math.max(x(active), 80), width - 80) }}
          >
            <span className="font-semibold">{longDate.format(new Date(`${hovered.day}T00:00:00Z`))}</span>
            {SERIES.map((series) => (
              <span key={series.key} className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <span className="size-2 rounded-full" style={{ background: series.color }} aria-hidden />
                  {series.label}
                </span>
                <span className="font-medium tabular-nums">{count.format(hovered[series.key])}</span>
              </span>
            ))}
          </div>
        ) : null}
      </div>
      <details className="text-xs">
        <summary className="cursor-pointer text-muted-foreground">Xem dạng bảng</summary>
        <table className="mt-2 w-full text-left tabular-nums">
          <thead className="text-muted-foreground">
            <tr>
              <th className="py-1 font-medium">Ngày</th>
              {SERIES.map((series) => (
                <th key={series.key} className="py-1 text-right font-medium">
                  {series.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map((day) => (
              <tr key={day.day} className="border-t">
                <td className="py-1">{shortDate.format(new Date(`${day.day}T00:00:00Z`))}</td>
                {SERIES.map((series) => (
                  <td key={series.key} className="py-1 text-right">
                    {count.format(day[series.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  )
}
