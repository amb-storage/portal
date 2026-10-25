import { createFileRoute } from '@tanstack/react-router'
import { LoadingBlock } from '@/components/common/query-state'
import { orderDetailQuery } from '@/features/orders/queries'
import { OrderDetailPage } from '@/features/orders/pages/order-detail-page'
import type { OrderDetail } from '@/features/orders/types'

export const Route = createFileRoute('/_app/orders/$orderId')({
  staticData: { crumb: { title: (detail: OrderDetail) => detail.order.order_number, parent: { title: 'Đơn hàng', to: '/orders' } } },
  loader: ({ context, params }) => context.queryClient.ensureQueryData(orderDetailQuery(params.orderId)),
  pendingComponent: LoadingBlock,
  component: OrderDetailPage,
})
