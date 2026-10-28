import { useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { useElementWidth } from '@/hooks/use-element-width'

const HEIGHT = 220
const PAD = { top: 12, right: 8, bottom: 24, left: 64 }
const MAX_BAR = 24
const GAP = 2
const RADIUS = 4

const shortDate = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', timeZone: 'UTC' })
const longDate = new Intl.DateTimeFormat('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit', timeZone: 'UTC' })

export interface DailyPoint {
  key: string
  /** Midnight UTC of the day (labels are formatted in UTC). */
  date: Date
  value: number
  /** Extra tooltip line, e.g. "3 đơn". */
  detail?: string
}

/** Rounds up to 1/2/5 × 10^n so gridlines land on readable values. */
function niceMax(value: number) {
  if (value <= 0) return 1
  const step = 10 ** Math.floor(Math.log10(value))
  return [1, 2, 5, 10].map((m) => m * step).find((candidate) => candidate >= value) ?? value
}

/** Column path: 4px rounded data-end, square at the baseline. */
function columnPath(x: number, y: number, width: number, height: number) {
  const r = Math.min(RADIUS, width / 2, height)
  return `M${x},${y + height}V${y + r}Q${x},${y} ${x + r},${y}H${x + width - r}Q${x + width},${y} ${x + width},${y + r}V${y + height}Z`
}

interface DailyBarsProps {
  points: DailyPoint[]
  format: (value: number) => string
  ariaLabel: string
  isLoading: boolean
}

/** Single-series daily column chart with a per-bar hover/focus tooltip (one hue, no legend). */
export function DailyBars({ points, format, ariaLabel, isLoading }: DailyBarsProps) {
  const { ref, width } = useElementWidth<HTMLDivElement>()
  const [active, setActive] = useState<number | null>(null)
  const max = niceMax(Math.max(...points.map((point) => point.value), 0))
  const plotW = Math.max(width - PAD.left - PAD.right, 0)
  const plotH = HEIGHT - PAD.top - PAD.bottom
  const slot = points.length ? plotW / points.length : 0
  const barW = Math.max(Math.min(MAX_BAR, slot - GAP), 1)
  const y = (value: number) => PAD.top + plotH - (value / max) * plotH
  const labelEvery = Math.max(1, Math.ceil(points.length / 6))
  const hovered = active === null ? null : points[active]

  return (
    <div ref={ref} className="relative" onPointerLeave={() => setActive(null)}>
      {width > 0 && !isLoading ? (
        <svg width={width} height={HEIGHT} role="img" aria-label={ariaLabel}>
          {[0, 0.5, 1].map((ratio) => (
            <g key={ratio}>
              <line x1={PAD.left} x2={width - PAD.right} y1={y(max * ratio)} y2={y(max * ratio)} className="stroke-border" strokeDasharray={ratio === 0 ? undefined : '2 4'} />
              <text x={PAD.left - 8} y={y(max * ratio)} dy="0.32em" textAnchor="end" className="fill-muted-foreground text-[11px] tabular-nums">
                {format(max * ratio)}
              </text>
            </g>
          ))}
          {points.map((point, index) => {
            const x = PAD.left + index * slot + (slot - barW) / 2
            const barH = PAD.top + plotH - y(point.value)
            return (
              <g
                key={point.key}
                tabIndex={0}
                aria-label={`${longDate.format(point.date)}: ${format(point.value)}${point.detail ? `, ${point.detail}` : ''}`}
                onPointerEnter={() => setActive(index)}
                onFocus={() => setActive(index)}
                onBlur={() => setActive(null)}
                className="outline-none"
              >
                <rect x={PAD.left + index * slot} y={PAD.top} width={slot} height={plotH} fill="transparent" />
                {point.value > 0 ? (
                  <path d={columnPath(x, y(point.value), barW, barH)} fill="var(--viz-series-1)" opacity={active === null || active === index ? 1 : 0.45} />
                ) : null}
                {(points.length - 1 - index) % labelEvery === 0 ? (
                  <text x={x + barW / 2} y={HEIGHT - 6} textAnchor="middle" className="fill-muted-foreground text-[11px]">
                    {shortDate.format(point.date)}
                  </text>
                ) : null}
              </g>
            )
          })}
        </svg>
      ) : (
        <Skeleton style={{ height: HEIGHT }} />
      )}
      {hovered && active !== null ? (
        <div
          className="pointer-events-none absolute top-0 z-10 grid -translate-x-1/2 gap-0.5 rounded-md border bg-popover px-3 py-2 text-xs shadow-md"
          style={{ left: Math.min(Math.max(PAD.left + (active + 0.5) * slot, 70), width - 70) }}
        >
          <span className="text-sm font-semibold tabular-nums">{format(hovered.value)}</span>
          <span className="text-muted-foreground">
            {longDate.format(hovered.date)}
            {hovered.detail ? ` · ${hovered.detail}` : ''}
          </span>
        </div>
      ) : null}
    </div>
  )
}
