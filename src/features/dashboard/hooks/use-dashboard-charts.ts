import { useQueries, useQuery } from '@tanstack/react-query'
import { useCan } from '@/features/auth/hooks/use-permission'
import { orderListQuery } from '@/features/orders/queries'
import { ORDER_STATUSES } from '@/features/orders/types'
import { PERMISSIONS } from '@/lib/permissions'
import { dailyRevenue } from '../revenue'

/** API max page size; revenue is computed from the most recent paid orders. */
const RECENT_PAID_LIMIT = 100

export function useDashboardCharts() {
  const enabled = useCan(PERMISSIONS.ordersRead)
  const paid = useQuery({ ...orderListQuery({ page: 1, limit: RECENT_PAID_LIMIT, status: 'PAID' }), enabled })
  const byStatus = useQueries({
    queries: ORDER_STATUSES.map((status) => ({ ...orderListQuery({ page: 1, limit: 1, status }), enabled })),
  })

  const items = paid.data?.items ?? []
  return {
    enabled,
    revenue: {
      days: dailyRevenue(items),
      currency: items[0]?.currency ?? 'JPY',
      // Older paid orders beyond the page are not counted.
      truncated: (paid.data?.total ?? 0) > RECENT_PAID_LIMIT,
      isLoading: paid.isPending,
      error: paid.error,
    },
    statuses: {
      rows: ORDER_STATUSES.map((status, index) => ({ status, count: byStatus[index]?.data?.total })),
      isLoading: byStatus.some((query) => query.isPending),
      error: byStatus.find((query) => query.error)?.error,
    },
  }
}
