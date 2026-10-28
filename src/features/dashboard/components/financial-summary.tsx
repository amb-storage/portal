import type { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorAlert } from '@/components/common/query-state'
import { formatMoney } from '@/lib/format'
import type { FinancialDashboard } from '../types'

interface FinancialSummaryProps {
  data: FinancialDashboard | undefined
  isLoading: boolean
  error: unknown
}

function Tile({ label, value, hint, emphasis }: { label: string; value: ReactNode; hint?: string; emphasis?: boolean }) {
  return (
    <div className="grid content-start gap-1 rounded-lg border p-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={emphasis ? 'text-2xl font-semibold tabular-nums' : 'text-xl font-semibold tabular-nums'}>{value}</span>
      {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
    </div>
  )
}

/** Totals from GET /admin/orders/financial-dashboard; the API is the only source of these numbers. */
export function FinancialSummary({ data, isLoading, error }: FinancialSummaryProps) {
  const money = (amount: number | undefined) => (isLoading || amount === undefined ? <Skeleton className="h-7 w-28" /> : formatMoney(amount, data?.currency ?? 'JPY'))
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tài chính</CardTitle>
        <CardDescription>Đơn đã thanh toán trong khoảng thời gian đã chọn (tính theo ngày UTC). Thuế không cộng thêm vào doanh thu: đó là phần thuế tách ra từ số tiền khách đã trả, theo hoá đơn của từng đơn.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        <ErrorAlert error={error} />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Tile label="Tổng doanh thu" value={money(data?.grossRevenue)} hint="Tổng tiền khách đã trả (đã gồm thuế)" emphasis />
          <Tile label="Tổng thuế" value={money(data?.taxCollected)} hint="Phần thuế nằm trong doanh thu, như trên hoá đơn" emphasis />
          <Tile label="Hoàn tiền" value={money(data?.refunds)} hint="Đơn đã hoàn tiền (toàn bộ đơn)" />
          <Tile label="Doanh thu thuần" value={money(data?.netSales)} hint="= Tổng doanh thu − Thuế − Hoàn tiền" />
          <Tile label="Đơn đã thanh toán" value={isLoading || !data ? <Skeleton className="h-7 w-12" /> : data.paidOrders} />
        </div>
      </CardContent>
    </Card>
  )
}
