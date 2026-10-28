import { AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { FirstPartyViewsEnvelope } from '../types'
import { DailyBars } from './daily-bars'
import { RankedList } from './ranked-list'

const count = new Intl.NumberFormat('vi-VN')

function Tile({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <div className="grid content-start gap-1 rounded-lg border p-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-2xl font-semibold tabular-nums">{count.format(value)}</span>
      {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
    </div>
  )
}

/** First-party views from the API (POST /views on the Web); shown whatever GoatCounter's state. */
export function ViewsCard({ envelope, isLoading }: { envelope: FirstPartyViewsEnvelope | undefined; isLoading: boolean }) {
  const data = envelope?.status === 'ok' ? envelope.data : null
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lượt xem website</CardTitle>
        <CardDescription>Đếm trên server: mỗi khách (IP + trình duyệt) tính 1 lượt xem site và 1 lượt cho mỗi sản phẩm trong mỗi nửa ngày (giờ Nhật).</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        {isLoading && !envelope ? (
          <Skeleton className="h-64" />
        ) : !envelope ? (
          <p className="text-sm text-muted-foreground">API hiện tại chưa có số liệu lượt xem (cần bản backend có tính năng đếm lượt xem).</p>
        ) : envelope.status !== 'ok' || !data ? (
          <Alert>
            <AlertTriangle />
            <AlertTitle>{envelope.status === 'not_configured' ? 'Chưa bật đếm lượt xem' : 'Không lấy được số liệu lượt xem'}</AlertTitle>
            <AlertDescription>
              {envelope.status === 'not_configured' ? 'Backend chưa có ANALYTICS_VISITOR_SECRET nên chưa ghi lượt xem. Liên hệ kỹ thuật.' : 'Thử tải lại sau ít phút.'}
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-3">
              <Tile label="Lượt xem site" value={data.metrics.siteViews} />
              <Tile label="Lượt xem sản phẩm" value={data.metrics.productViews} />
              <Tile label="Số khách" value={data.metrics.uniqueVisitors} hint="Khách khác nhau trong khoảng thời gian" />
            </div>
            <div className="grid gap-2">
              <h3 className="text-sm font-semibold">Lượt xem site theo ngày</h3>
              <DailyBars
                points={data.traffic.map((point) => ({
                  key: point.day,
                  date: new Date(`${point.day}T00:00:00Z`),
                  value: point.siteViews,
                  detail: `${count.format(point.productViews)} lượt xem sản phẩm`,
                }))}
                format={(value) => count.format(Math.round(value))}
                ariaLabel={`Lượt xem site theo ngày, tổng ${count.format(data.metrics.siteViews)}`}
                isLoading={false}
              />
            </div>
            <RankedList
              title="Sản phẩm được xem nhiều nhất"
              unit="lượt xem"
              empty="Chưa có lượt xem sản phẩm nào trong khoảng này."
              rows={data.topProducts.map((product) => ({
                key: product.productId,
                label: product.nameJa || product.nameEn || product.slug || product.productId,
                hint: [product.nameJa, product.nameEn, product.slug].filter(Boolean).join(' · '),
                value: product.views,
                meta: `${count.format(product.orders)} đơn đã thanh toán · tỉ lệ mua ${product.conversionRate.toFixed(1)}%`,
                link: { to: '/catalog/products/$productId', params: { productId: product.productId } },
              }))}
            />
          </>
        )}
      </CardContent>
    </Card>
  )
}
