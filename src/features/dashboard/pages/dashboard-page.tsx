import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PageHeader } from '@/components/common/page-header'
import { cn } from '@/lib/utils'
import { AnalyticsCard } from '../components/analytics-card'
import { FinancialSummary } from '../components/financial-summary'
import { OrderStatusChart } from '../components/order-status-chart'
import { RevenueChart } from '../components/revenue-chart'
import { StatCard } from '../components/stat-card'
import { ViewsCard } from '../components/views-card'
import { useDashboardCharts } from '../hooks/use-dashboard-charts'
import { useDashboardPage } from '../hooks/use-dashboard-page'
import { analyticsQuery, financialQuery } from '../queries'
import { lastDays, RANGE_PRESETS, type RangeDays } from '../types'

const shortDate = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' })

/** One time range for every money/traffic panel (both APIs cap the range at 90 UTC days). */
function RangePicker({ value, onChange }: { value: RangeDays; onChange: (days: RangeDays) => void }) {
  return (
    <div role="group" aria-label="Khoảng thời gian" className="inline-flex rounded-lg border bg-muted/40 p-0.5 text-sm">
      {RANGE_PRESETS.map((days) => (
        <button
          key={days}
          type="button"
          aria-pressed={value === days}
          onClick={() => onChange(days)}
          className={cn('rounded-md px-3 py-1 text-muted-foreground', value === days && 'bg-background text-foreground shadow-xs')}
        >
          {days} ngày
        </button>
      ))}
    </div>
  )
}

export function DashboardPage() {
  const { admin, stats } = useDashboardPage()
  const [days, setDays] = useState<RangeDays>(30)
  const range = lastDays(days)
  const charts = useDashboardCharts(range)
  // Financial totals and analytics both need orders.read, the same gate as the order charts.
  const financial = useQuery({ ...financialQuery(range), enabled: charts.enabled })
  const analytics = useQuery({ ...analyticsQuery(range), enabled: charts.enabled })
  const rangeText = `${shortDate.format(new Date(`${range.from}T00:00:00Z`))} – ${shortDate.format(new Date(`${range.to}T00:00:00Z`))}`

  return (
    <>
      <PageHeader
        title={`Xin chào, ${admin.displayName || admin.email}`}
        description={charts.enabled ? `Tổng quan bán hàng, truy cập và nội dung · ${rangeText}` : 'Tổng quan sản phẩm và nội dung.'}
        actions={charts.enabled ? <RangePicker value={days} onChange={setDays} /> : null}
      />
      {charts.enabled ? (
        <>
          <FinancialSummary data={financial.data} isLoading={financial.isPending} error={financial.error} />
          <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
            <RevenueChart {...charts.revenue} />
            <OrderStatusChart {...charts.statuses} />
          </div>
        </>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>
      {charts.enabled ? (
        <>
          {/* First-party views do not depend on GoatCounter, so they come first. */}
          <ViewsCard envelope={analytics.data?.views} isLoading={analytics.isPending} />
          <AnalyticsCard envelope={analytics.data} isLoading={analytics.isPending} error={analytics.error} />
        </>
      ) : null}
      {stats.length === 0 ? <p className="text-sm text-muted-foreground">Tài khoản của bạn chưa có quyền xem mục nào. Liên hệ quản trị viên.</p> : null}
    </>
  )
}
