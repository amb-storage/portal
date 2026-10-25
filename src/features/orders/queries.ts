import { keepPreviousData, queryOptions } from '@tanstack/react-query'
import { orderService } from './order.service'
import type { OrderListQuery } from './types'

export const orderKeys = {
  all: ['orders'] as const,
  list: (query: OrderListQuery) => [...orderKeys.all, 'list', query] as const,
  detail: (id: string) => [...orderKeys.all, 'detail', id] as const,
}

export const orderListQuery = (query: OrderListQuery) =>
  queryOptions({ queryKey: orderKeys.list(query), queryFn: () => orderService.list(query), placeholderData: keepPreviousData })

export const orderDetailQuery = (id: string) =>
  queryOptions({ queryKey: orderKeys.detail(id), queryFn: () => orderService.get(id) })
