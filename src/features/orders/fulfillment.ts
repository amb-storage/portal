import type { FulfillmentStatus, Order } from './types'

/** Mirrors OrdersService.updateOrder: PAID only, UNFULFILLED → SHIPPED → DELIVERED. */
const NEXT: Record<FulfillmentStatus, FulfillmentStatus[]> = {
  UNFULFILLED: ['UNFULFILLED', 'SHIPPED'],
  SHIPPED: ['SHIPPED', 'DELIVERED'],
  DELIVERED: ['DELIVERED'],
}

export function allowedFulfillment(order: Order): FulfillmentStatus[] {
  return order.status === 'PAID' ? NEXT[order.fulfillment_status] : [order.fulfillment_status]
}

export function canRefund(order: Order) {
  return order.status === 'PAID' && Boolean(order.stripe_payment_intent_id) && !order.refunded_at
}
