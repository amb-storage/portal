import type { ReactNode } from 'react'
import { Check, Copy, MapPin } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { JsonView } from '@/components/common/json-view'

/** Address the customer typed in the website's checkout form (buildCanonicalDeliverySnapshot on the API). */
interface CheckoutAddress {
  country?: string
  postalCode?: string
  prefecture?: string
  city?: string
  addressLine1?: string
  addressLine2?: string
}

interface StripeAddress {
  line1?: string | null
  line2?: string | null
  city?: string | null
  state?: string | null
  postal_code?: string | null
  country?: string | null
}

interface StripeDetails {
  customerDetails?: { name?: string | null; email?: string | null; phone?: string | null; address?: StripeAddress | null } | null
  shippingDetails?: { name?: string | null; phone?: string | null; address?: StripeAddress | null } | null
}

/**
 * shipping_snapshot: `{ version: 1, source: 'APPLICATION', recipientName, phoneNumber, shippingAddress }`
 * from checkout, plus `stripe` (what Stripe collected) once the payment webhook runs. Orders from
 * before that format only have the Stripe fields at the top level.
 */
interface ShippingSnapshot extends StripeDetails {
  recipientName?: string
  phoneNumber?: string
  shippingAddress?: CheckoutAddress
  stripe?: StripeDetails | null
}

interface Delivery {
  name: string | null
  phone: string | null
  lines: string[]
}

const JAPAN = new Set(['JP', 'JPN', 'JAPAN', '日本'])
const isJapan = (country: string | null | undefined) => !country || JAPAN.has(country.trim().toUpperCase())
const COUNTRY_NAMES: Record<string, string> = { JP: 'Nhật Bản', JPN: 'Nhật Bản', JAPAN: 'Nhật Bản', '日本': 'Nhật Bản' }
const countryName = (country: string | null | undefined) => (country ? (COUNTRY_NAMES[country.trim().toUpperCase()] ?? country) : null)

const joinLine = (...parts: Array<string | null | undefined>) => parts.filter(Boolean).join(' ')

/** Japanese label order: 〒postal / prefecture city / street lines; country only when abroad. */
function formatLines(postal: string | null | undefined, region: string | null | undefined, city: string | null | undefined, line1: string | null | undefined, line2: string | null | undefined, country: string | null | undefined) {
  return [
    postal ? `〒${postal}` : null,
    joinLine(region, city) || null,
    line1,
    line2,
    isJapan(country) ? null : countryName(country),
  ].filter((line): line is string => Boolean(line))
}

function fromCheckout(snapshot: ShippingSnapshot): Delivery | null {
  const address = snapshot.shippingAddress
  if (!snapshot.recipientName && !address) return null
  return {
    name: snapshot.recipientName || null,
    phone: snapshot.phoneNumber || null,
    lines: address ? formatLines(address.postalCode, address.prefecture, address.city, address.addressLine1, address.addressLine2, address.country) : [],
  }
}

function fromStripe(details: StripeDetails | null | undefined): Delivery | null {
  if (!details) return null
  const shipping = details.shippingDetails
  const customer = details.customerDetails
  const address = shipping?.address ?? customer?.address
  if (!shipping && !customer) return null
  return {
    name: shipping?.name || customer?.name || null,
    phone: shipping?.phone || customer?.phone || null,
    lines: address ? formatLines(address.postal_code, address.state, address.city, address.line1, address.line2, address.country) : [],
  }
}

function isRecord(value: unknown): value is ShippingSnapshot {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() =>
        void navigator.clipboard.writeText(text).then(() => {
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        })
      }
    >
      {copied ? <Check /> : <Copy />} {copied ? 'Đã chép' : 'Chép địa chỉ'}
    </Button>
  )
}

export function ShippingCard({ snapshot, email }: { snapshot: unknown; email?: string | null }) {
  const record = isRecord(snapshot) ? snapshot : null
  // Unpaid orders can carry an empty `{}`: that is "nothing yet", not unreadable data.
  const hasData = record ? Object.keys(record).length > 0 : Boolean(snapshot)
  const checkout = record ? fromCheckout(record) : null
  // Newer orders keep Stripe's data under `stripe`; older ones have it at the top level.
  const stripe = record ? (fromStripe(record.stripe) ?? fromStripe(record)) : null
  const delivery = checkout ?? stripe
  const stripeEmail = record?.stripe?.customerDetails?.email ?? record?.customerDetails?.email ?? null
  const contactEmail = email || stripeEmail
  // Only worth showing when Stripe's name/address differ from what was typed at checkout.
  const stripeDiffers = Boolean(checkout && stripe && (stripe.name !== checkout.name || stripe.lines.join('|') !== checkout.lines.join('|')))
  const labelText = delivery ? [delivery.name ? `${delivery.name} 様` : null, ...delivery.lines, delivery.phone ? `TEL ${delivery.phone}` : null].filter(Boolean).join('\n') : ''

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin giao hàng</CardTitle>
        <CardDescription>{checkout ? 'Khách nhập khi đặt hàng.' : stripe ? 'Khách nhập trên trang thanh toán Stripe.' : null}</CardDescription>
        {delivery?.lines.length ? (
          <CardAction>
            <CopyButton text={labelText} />
          </CardAction>
        ) : null}
      </CardHeader>
      <CardContent className="grid gap-3 text-sm">
        {delivery ? (
          <>
            <Row label="Người nhận">{delivery.name ? <span className="font-medium">{delivery.name}</span> : '—'}</Row>
            <Row label="Điện thoại">{delivery.phone ? <a href={`tel:${delivery.phone.replace(/[^\d+]/g, '')}`} className="hover:underline">{delivery.phone}</a> : '—'}</Row>
            <Row label="Email">{contactEmail ? <a href={`mailto:${contactEmail}`} className="break-all hover:underline">{contactEmail}</a> : '—'}</Row>
            <Row label="Địa chỉ">
              {delivery.lines.length ? (
                <address className="flex gap-2 not-italic">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <span>
                    {delivery.lines.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </span>
                </address>
              ) : (
                '—'
              )}
            </Row>
            {stripeDiffers && stripe ? (
              <div className="grid gap-1 rounded-md bg-amber-50 p-3 text-xs text-amber-900 dark:bg-amber-400/10 dark:text-amber-200">
                <span className="font-medium">Thông tin trên Stripe khác với lúc đặt hàng</span>
                <span>{[stripe.name, ...stripe.lines].filter(Boolean).join(' · ')}</span>
              </div>
            ) : null}
          </>
        ) : (
          <p className="text-muted-foreground">{hasData ? 'Không đọc được thông tin giao hàng của đơn này.' : 'Chưa có thông tin giao hàng.'}</p>
        )}
        {hasData && !delivery ? (
          <details className="text-xs">
            <summary className="cursor-pointer text-muted-foreground">Dữ liệu gốc (cho kỹ thuật)</summary>
            <div className="mt-2">
              <JsonView value={snapshot} />
            </div>
          </details>
        ) : null}
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
