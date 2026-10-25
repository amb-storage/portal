import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorAlert } from '@/components/common/query-state'
import { useElementWidth } from '@/hooks/use-element-width'
import { formatMoney } from '@/lib/format'
import type { DailyRevenue } from '../revenue'

const HEIGHT = 220
const PAD = { top: 12, right: 8, bottom: 24, left: 64 }
const MAX_BAR = 24
const GAP = 2
const RADIUS = 4

const shortDate = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit' })
const longDate = new Intl.DateTimeFormat('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' })

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

interface RevenueChartProps {
  days: DailyRevenue[]
  currency: string
  truncated: boolean
  isLoading: boolean
  error: unknown
}

export function RevenueChart({ days, currency, truncated, isLoading, error }: RevenueChartProps) {
  const { ref, width } = useElementWidth<HTMLDivElement>()
  const [active, setActive] = useState<number | null>(null)
  const total = days.reduce((sum, day) => sum + day.amount, 0)
  const orders = days.reduce((sum, day) => sum + day.orders, 0)
  const max = niceMax(Math.max(...days.map((day) => day.amount), 0))
  const plotW = Math.max(width - PAD.left - PAD.right, 0)
  const plotH = HEIGHT - PAD.top - PAD.bottom
  const slot = days.length ? plotW / days.length : 0
  const barW = Math.max(Math.min(MAX_BAR, slot - GAP), 1)
  const y = (amount: number) => PAD.top + plotH - (amount / max) * plotH
  const hovered = active === null ? null : days[active]

  return (
    <Card>
      <CardHeader>
        <CardDescription>Doanh thu 30 ngày qua</CardDescription>
        <CardTitle className="text-3xl tabular-nums">{isLoading ? <Skeleton className="h-9 w-40" /> : formatMoney(total, currency)}</CardTitle>
        <CardDescription>
          {orders} đơn đã thanh toán{truncated ? ' · tính trên 100 đơn đã thanh toán gần nhất' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ErrorAlert error={error} />
        <div ref={ref} className="relative" onPointerLeave={() => setActive(null)}>
          {width > 0 && !isLoading ? (
            <svg width={width} height={HEIGHT} role="img" aria-label={`Doanh thu theo ngày, tổng ${formatMoney(total, currency)}`}>
              {[0, 0.5, 1].map((ratio) => (
                <g key={ratio}>
                  <line x1={PAD.left} x2={width - PAD.right} y1={y(max * ratio)} y2={y(max * ratio)} className="stroke-border" strokeDasharray={ratio === 0 ? undefined : '2 4'} />
                  <text x={PAD.left - 8} y={y(max * ratio)} dy="0.32em" textAnchor="end" className="fill-muted-foreground text-[11px] tabular-nums">
                    {formatMoney(max * ratio, currency)}
                  </text>
                </g>
              ))}
              {days.map((day, index) => {
                const x = PAD.left + index * slot + (slot - barW) / 2
                const barH = PAD.top + plotH - y(day.amount)
                return (
                  <g
                    key={day.day}
                    tabIndex={0}
                    aria-label={`${longDate.format(day.date)}: ${formatMoney(day.amount, currency)}, ${day.orders} đơn`}
                    onPointerEnter={() => setActive(index)}
                    onFocus={() => setActive(index)}
                    onBlur={() => setActive(null)}
                    className="outline-none"
                  >
                    <rect x={PAD.left + index * slot} y={PAD.top} width={slot} height={plotH} fill="transparent" />
                    {day.amount > 0 ? (
                      <path d={columnPath(x, y(day.amount), barW, barH)} fill="var(--viz-series-1)" opacity={active === null || active === index ? 1 : 0.45} />
                    ) : null}
                    {index % 7 === days.length % 7 || index === days.length - 1 ? (
                      <text x={x + barW / 2} y={HEIGHT - 6} textAnchor="middle" className="fill-muted-foreground text-[11px]">
                        {shortDate.format(day.date)}
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
              <span className="text-sm font-semibold tabular-nums">{formatMoney(hovered.amount, currency)}</span>
              <span className="text-muted-foreground">
                {longDate.format(hovered.date)} · {hovered.orders} đơn
              </span>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
