import type { ISODate } from '@/lib/api/types'

export const ORDER_STATUSES = ['PENDING_PAYMENT', 'PAID', 'PAYMENT_FAILED', 'CANCELLED'] as const
export const FULFILLMENT_STATUSES = ['UNFULFILLED', 'SHIPPED', 'DELIVERED'] as const

/** Mirrors MAX_RECEIPT_ATTEMPTS in receipt-delivery.service.ts; beyond it delivery stops (FAILED). */
export const MAX_RECEIPT_ATTEMPTS = 8

export type OrderStatus = (typeof ORDER_STATUSES)[number]
export type FulfillmentStatus = (typeof FULFILLMENT_STATUSES)[number]

/** Order rows are returned raw from SQL (snake_case). Amounts are minor units. */
export interface OrderSummary {
  id: string
  order_number: string
  email: string
  currency: string
  subtotal_amount: number
  shipping_amount: number
  tax_amount: number
  /** Order tax snapshot, fixed when the Order was created (0 when no tax applied). */
  tax_rate_percent: number | null
  tax_calculation_mode: 'NONE' | 'TAX_INCLUDED' | 'TAX_EXCLUDED' | null
  total_amount: number
  status: OrderStatus
  fulfillment_status: FulfillmentStatus
  carrier: string | null
  tracking_number: string | null
  stripe_checkout_session_id: string | null
  stripe_payment_intent_id: string | null
  refunded_at: ISODate | null
  paid_at: ISODate | null
  receipt_sent_at: ISODate | null
  created_at: ISODate
}

export interface Order extends OrderSummary {
  customer_id: string | null
  shipping_snapshot: unknown
  internal_note: string | null
  stripe_checkout_url: string | null
  stripe_refund_id: string | null
  receipt_attempts: number
  receipt_last_error: string | null
}

export interface OrderItem {
  product_id: string
  product_slug: string | null
  product_name: string | null
  image_url: string | null
  unit_price: number
  quantity: number
  line_total: number
  snapshot: unknown
}

export interface PaymentEvent {
  provider: string
  eventId: string
  type: string
  processedAt: ISODate
}

export interface OrderDetail {
  order: Order
  items: OrderItem[]
  paymentEvents: PaymentEvent[]
}

export interface OrderListQuery {
  page: number
  limit: number
  q?: string
  status?: OrderStatus
  fulfillmentStatus?: FulfillmentStatus
}

export interface OrderUpdateInput {
  fulfillmentStatus?: FulfillmentStatus
  carrier?: string | null
  trackingNumber?: string | null
  internalNote?: string | null
}

export type RefundResult =
  | { orderId: string; refundId: string; status: string }
  | { orderId: string; alreadyRefunded: true }
