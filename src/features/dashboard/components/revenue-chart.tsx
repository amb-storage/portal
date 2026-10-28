import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorAlert } from '@/components/common/query-state'
import { formatMoney } from '@/lib/format'
import type { DailyRevenue } from '../revenue'
import { DailyBars } from './daily-bars'

interface RevenueChartProps {
  days: DailyRevenue[]
  currency: string
  truncated: boolean
  isLoading: boolean
  error: unknown
}

export function RevenueChart({ days, currency, truncated, isLoading, error }: RevenueChartProps) {
  const total = days.reduce((sum, day) => sum + day.amount, 0)
  const orders = days.reduce((sum, day) => sum + day.orders, 0)
  const tax = days.reduce((sum, day) => sum + day.tax, 0)
  return (
    <Card>
      <CardHeader>
        <CardDescription>Doanh thu theo ngày</CardDescription>
        <CardTitle className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
          {isLoading ? (
            <Skeleton className="h-9 w-40" />
          ) : (
            <>
              <span className="text-3xl tabular-nums">{formatMoney(total, currency)}</span>
              <span className="text-base font-normal text-muted-foreground">
                Tổng thuế <span className="font-semibold text-foreground tabular-nums">{formatMoney(tax, currency)}</span>
              </span>
            </>
          )}
        </CardTitle>
        <CardDescription>
          {orders} đơn đã thanh toán · thuế đã nằm trong doanh thu{truncated ? ' · tính trên 100 đơn đã thanh toán gần nhất' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ErrorAlert error={error} />
        <DailyBars
          points={days.map((day) => ({ key: day.day, date: new Date(`${day.day}T00:00:00Z`), value: day.amount, detail: `${day.orders} đơn · thuế ${formatMoney(day.tax, currency)}` }))}
          format={(value) => formatMoney(value, currency)}
          ariaLabel={`Doanh thu theo ngày, tổng ${formatMoney(total, currency)}`}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  )
}
