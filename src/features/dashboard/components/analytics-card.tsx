import { AlertTriangle, Info } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorAlert } from '@/components/common/query-state'
import type { AnalyticsEnvelope, AnalyticsStatus, Breakdown } from '../types'
import { DailyBars } from './daily-bars'
import { RankedList } from './ranked-list'

const count = new Intl.NumberFormat('vi-VN')

const STATUS_TEXT: Record<Exclude<AnalyticsStatus, 'ok'>, { title: string; body: string }> = {
  not_configured: { title: 'Chưa kết nối GoatCounter', body: 'Backend chưa có GOATCOUNTER_API_TOKEN nên chưa có số liệu truy cập. Liên hệ kỹ thuật để cấu hình.' },
  unauthorized: { title: 'GoatCounter từ chối đăng nhập', body: 'Token GoatCounter không hợp lệ hoặc đã hết hạn. Liên hệ kỹ thuật để cấp lại.' },
  forbidden: { title: 'GoatCounter không cho truy cập site', body: 'Token không có quyền xem site đã cấu hình. Liên hệ kỹ thuật.' },
  rate_limited: { title: 'GoatCounter đang giới hạn lượt gọi', body: 'Thử lại sau ít phút.' },
  unavailable: { title: 'GoatCounter tạm thời không phản hồi', body: 'Thử lại sau ít phút.' },
}

const EVENT_LABELS = {
  view_product: 'Xem sản phẩm',
  add_to_cart: 'Thêm vào giỏ',
  begin_checkout: 'Bắt đầu thanh toán',
} as const

const toRows = (items: Breakdown[]) => items.map((item) => ({ key: item.name, label: item.name, value: item.visitors }))

interface AnalyticsCardProps {
  envelope: AnalyticsEnvelope | undefined
  isLoading: boolean
  error: unknown
}

/** GoatCounter numbers keep the provider's meaning: visitor counts, not unique people or pageviews. */
export function AnalyticsCard({ envelope, isLoading, error }: AnalyticsCardProps) {
  const data = envelope?.status === 'ok' ? envelope.data : null
  const problem = envelope && envelope.status !== 'ok' ? STATUS_TEXT[envelope.status] : null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Truy cập (GoatCounter)</CardTitle>
        <CardDescription>Số liệu từ GoatCounter: “lượt khách” là số khách GoatCounter ghi nhận, không phải số người duy nhất hay số lượt xem trang.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <ErrorAlert error={error} />
        {problem ? (
          // Never show zeros for a missing provider: say why there is no data.
          <Alert>
            <AlertTriangle />
            <AlertTitle>{problem.title}</AlertTitle>
            <AlertDescription>{problem.body}</AlertDescription>
          </Alert>
        ) : null}
        {envelope?.stale ? (
          <Alert>
            <Info />
            <AlertTitle>Đang hiện số liệu lưu tạm</AlertTitle>
            <AlertDescription>GoatCounter tạm thời không phản hồi; số liệu bên dưới là lần lấy gần nhất.</AlertDescription>
          </Alert>
        ) : null}
        {isLoading && !envelope ? (
          <Skeleton className="h-64" />
        ) : data ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_2fr]">
              <div className="grid gap-1 rounded-lg border p-4">
                <span className="text-sm text-muted-foreground">Lượt khách</span>
                <span className="text-2xl font-semibold tabular-nums">{count.format(data.metrics.visitors)}</span>
              </div>
              <div className="grid gap-1 rounded-lg border p-4">
                <span className="text-sm text-muted-foreground">Khách có tương tác</span>
                <span className="text-2xl font-semibold tabular-nums">{count.format(data.metrics.eventVisitors)}</span>
                <span className="text-xs text-muted-foreground">Xem sản phẩm, thêm giỏ, thanh toán</span>
              </div>
              <div className="grid gap-2 rounded-lg border p-4">
                <span className="text-sm text-muted-foreground">Hành động của khách</span>
                <ul className="grid gap-1 text-sm">
                  {data.events.map((event) => (
                    <li key={event.name} className="flex justify-between gap-3">
                      <span>{EVENT_LABELS[event.name]}</span>
                      <span className="tabular-nums font-medium">{count.format(event.count)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="grid gap-2">
              <h3 className="text-sm font-semibold">Lượt khách theo ngày</h3>
              <DailyBars
                points={data.traffic.map((point) => ({ key: point.day, date: new Date(`${point.day}T00:00:00Z`), value: point.visitors }))}
                format={(value) => count.format(Math.round(value))}
                ariaLabel={`Lượt khách theo ngày, tổng ${count.format(data.metrics.visitors)}`}
                isLoading={false}
              />
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <RankedList title="Trang được xem nhiều" rows={data.topPages.map((page) => ({ key: page.path, label: page.title || page.path, hint: page.path, value: page.visitors }))} />
              <RankedList title="Nguồn truy cập" rows={toRows(data.referrers)} empty="Chưa có (khách vào trực tiếp)" />
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  )
}
