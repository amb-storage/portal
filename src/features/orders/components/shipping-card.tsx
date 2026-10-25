import type { ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { JsonView } from '@/components/common/json-view'

interface StripeAddress {
  line1?: string | null
  line2?: string | null
  city?: string | null
  state?: string | null
  postal_code?: string | null
  country?: string | null
}

/** shipping_snapshot as written by the Stripe webhook (customer_details + shipping_details). */
interface ShippingSnapshot {
  customerDetails?: { name?: string | null; email?: string | null; phone?: string | null; address?: StripeAddress | null } | null
  shippingDetails?: { name?: string | null; phone?: string | null; address?: StripeAddress | null } | null
}

/** Japanese order: 〒postal · prefecture · city · street lines. */
function formatAddress(address: StripeAddress | null | undefined) {
  if (!address) return null
  const lines = [
    [address.postal_code ? `〒${address.postal_code}` : null, address.state, address.city].filter(Boolean).join(' '),
    address.line1,
    address.line2,
    address.country && address.country !== 'JP' ? address.country : null,
  ].filter(Boolean)
  return lines.length ? lines : null
}

function isSnapshot(value: unknown): value is ShippingSnapshot {
  return typeof value === 'object' && value !== null && ('customerDetails' in value || 'shippingDetails' in value)
}

export function ShippingCard({ snapshot }: { snapshot: unknown }) {
  const shipping = isSnapshot(snapshot) ? snapshot.shippingDetails : null
  const customer = isSnapshot(snapshot) ? snapshot.customerDetails : null
  const address = formatAddress(shipping?.address) ?? formatAddress(customer?.address)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin giao hàng</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm">
        {!isSnapshot(snapshot) ? (
          snapshot ? <JsonView value={snapshot} /> : <p className="text-muted-foreground">Có sau khi khách thanh toán.</p>
        ) : (
          <>
            <Row label="Người nhận">{shipping?.name || customer?.name || '—'}</Row>
            <Row label="Điện thoại">{shipping?.phone || customer?.phone || '—'}</Row>
            <Row label="Email">{customer?.email || '—'}</Row>
            <Row label="Địa chỉ">
              {address ? address.map((line) => <span key={line} className="block">{line}</span>) : '—'}
            </Row>
          </>
        )}
      </CardContent>
    </Card>
  )
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[110px_1fr] items-start gap-2">
      <span className="text-muted-foreground">{label}</span>
      <div className="min-w-0 break-words">{children}</div>
    </div>
  )
}
