import type { ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/common/status-badge'
import { formatDateTime, formatMoney } from '@/lib/format'
import { MAX_RECEIPT_ATTEMPTS, type Order } from '../types'

export function OrderSummaryCard({ order }: { order: Order }) {
  const money = (amount: number) => formatMoney(amount, order.currency)
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tóm tắt</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm">
        <Row label="Email">{order.email}</Row>
        <Row label="Thanh toán"><StatusBadge status={order.status} /></Row>
        <Row label="Giao hàng"><StatusBadge status={order.fulfillment_status} /></Row>
        <Row label="Tạm tính">{money(order.subtotal_amount)}</Row>
        <Row label="Phí vận chuyển">{money(order.shipping_amount)}</Row>
        <Row label="Thuế">
          <TaxLine order={order} money={money} />
        </Row>
        <Row label="Tổng cộng"><span className="font-semibold">{money(order.total_amount)}</span></Row>
        <Row label="Ngày tạo">{formatDateTime(order.created_at)}</Row>
        <Row label="Thanh toán lúc">{formatDateTime(order.paid_at)}</Row>
        <Row label="Hoàn tiền lúc">{formatDateTime(order.refunded_at)}</Row>
        <Row label="Hoá đơn">
          <ReceiptStatus order={order} />
        </Row>
        <Row label="Phiên Stripe"><code className="text-xs break-all">{order.stripe_checkout_session_id ?? '—'}</code></Row>
        <Row label="Mã thanh toán Stripe"><code className="text-xs break-all">{order.stripe_payment_intent_id ?? '—'}</code></Row>
        <Row label="Mã hoàn tiền"><code className="text-xs break-all">{order.stripe_refund_id ?? '—'}</code></Row>
      </CardContent>
    </Card>
  )
}

const TAX_MODE_TEXT = {
  NONE: 'Không tính thuế',
  TAX_INCLUDED: 'đã gồm trong giá',
  TAX_EXCLUDED: 'cộng thêm vào giá',
} as const

/** Tax snapshot stored on the Order when it was created; later setting changes do not affect it. */
function TaxLine({ order, money }: { order: Order; money: (amount: number) => string }) {
  const mode = order.tax_calculation_mode
  if (!mode || mode === 'NONE' || !order.tax_rate_percent)
    return (
      <>
        {money(order.tax_amount)}
        {mode === 'NONE' ? <span className="text-muted-foreground"> · không tính thuế</span> : null}
      </>
    )
  return (
    <>
      {money(order.tax_amount)}
      <span className="text-muted-foreground">
        {' '}
        · {order.tax_rate_percent}% {TAX_MODE_TEXT[mode]}
      </span>
    </>
  )
}

function ReceiptStatus({ order }: { order: Order }) {
  if (order.receipt_sent_at) return <>Đã gửi {formatDateTime(order.receipt_sent_at)}</>
  if (order.status !== 'PAID') return <span className="text-muted-foreground">Gửi sau khi thanh toán</span>
  const exhausted = order.receipt_attempts >= MAX_RECEIPT_ATTEMPTS
  return (
    <div className="grid gap-0.5">
      <span className={exhausted ? 'font-medium text-destructive' : undefined}>
        {exhausted ? 'Gửi thất bại, hệ thống đã ngừng thử lại' : 'Chưa gửi'} ({order.receipt_attempts}/{MAX_RECEIPT_ATTEMPTS} lần thử)
      </span>
      {order.receipt_last_error ? <span className="text-xs break-words text-muted-foreground">{order.receipt_last_error}</span> : null}
      {exhausted ? <span className="text-xs text-muted-foreground">Cần kỹ thuật xử lý thủ công (lệnh receipt:recover ở backend).</span> : null}
    </div>
  )
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr] items-start gap-2">
      <span className="text-muted-foreground">{label}</span>
      <div>{children}</div>
    </div>
  )
}
