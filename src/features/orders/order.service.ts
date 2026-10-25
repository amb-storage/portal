import { api } from '@/lib/api/client'
import type { Paginated } from '@/lib/api/types'
import type { OrderDetail, OrderListQuery, OrderSummary, OrderUpdateInput, RefundResult } from './types'

/** /api/v1/admin/orders/* (Checkout creation and the Stripe webhook are not Admin routes). */
export const orderService = {
  list: (query: OrderListQuery) => api.get<Paginated<OrderSummary>>('/orders', { ...query }),
  get: (id: string) => api.get<OrderDetail>(`/orders/${id}`),
  /** Fulfillment and order notes. */
  update: (id: string, body: OrderUpdateInput) => api.patch<Record<string, unknown>>(`/orders/${id}`, body),
  /** Completed refunds do not restock Product quantity. */
  refund: (id: string, reason?: string) => api.post<RefundResult>(`/orders/${id}/refunds`, { reason }),
}
