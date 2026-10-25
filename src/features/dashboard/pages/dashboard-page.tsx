import { PageHeader } from '@/components/common/page-header'
import { OrderStatusChart } from '../components/order-status-chart'
import { RevenueChart } from '../components/revenue-chart'
import { StatCard } from '../components/stat-card'
import { useDashboardCharts } from '../hooks/use-dashboard-charts'
import { useDashboardPage } from '../hooks/use-dashboard-page'

export function DashboardPage() {
  const { admin, stats } = useDashboardPage()
  const charts = useDashboardCharts()
  return (
    <>
      <PageHeader title={`Xin chào, ${admin.displayName || admin.email}`} description="Tổng quan sản phẩm, đơn hàng và nội dung." />
      {charts.enabled ? (
        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <RevenueChart {...charts.revenue} />
          <OrderStatusChart {...charts.statuses} />
        </div>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>
      {stats.length === 0 ? (
        <p className="text-sm text-muted-foreground">Tài khoản của bạn chưa có quyền xem mục nào. Liên hệ quản trị viên.</p>
      ) : null}
    </>
  )
}
