import { Link } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorAlert } from '@/components/common/query-state'
import type { OrderStatus } from '@/features/orders/types'
import { statusLabel } from '@/lib/labels'

interface OrderStatusChartProps {
  rows: Array<{ status: OrderStatus; count: number | undefined }>
  isLoading: boolean
  error: unknown
}

/** Horizontal bars, one hue: magnitude only. Each row links to the filtered order list. */
export function OrderStatusChart({ rows, isLoading, error }: OrderStatusChartProps) {
  const max = Math.max(...rows.map((row) => row.count ?? 0), 1)
  const total = rows.reduce((sum, row) => sum + (row.count ?? 0), 0)

  return (
    <Card>
      <CardHeader>
        <CardDescription>Đơn hàng theo trạng thái thanh toán</CardDescription>
        <CardTitle className="text-3xl tabular-nums">{isLoading ? <Skeleton className="h-9 w-16" /> : total}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        <ErrorAlert error={error} />
        {rows.map((row) => (
          <Link
            key={row.status}
            to="/orders"
            search={{ status: row.status }}
            className="group grid gap-1 rounded-md text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="flex items-baseline justify-between">
              <span className="text-muted-foreground group-hover:text-foreground">{statusLabel(row.status)}</span>
              <span className="font-medium tabular-nums">{row.count ?? '—'}</span>
            </div>
            <div className="h-3 rounded-r bg-muted/60">
              <div
                className="h-full rounded-r transition-[width] group-hover:opacity-80"
                style={{ width: `${((row.count ?? 0) / max) * 100}%`, background: 'var(--viz-series-1)' }}
              />
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}
