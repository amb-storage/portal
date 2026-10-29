import { createFileRoute } from '@tanstack/react-router'
import { LoadingBlock } from '@/components/common/query-state'
import { InvoicePage } from '@/features/orders/invoice/invoice-page'
import { orderDetailQuery } from '@/features/orders/queries'
import type { OrderDetail } from '@/features/orders/types'

export const Route = createFileRoute('/_app/orders/invoice/$orderId')({
  staticData: {
    crumb: {
      title: (detail: OrderDetail) => `Hoá đơn ${detail.order.order_number}`,
      parent: { title: 'Đơn hàng', to: '/orders' },
    },
  },
  loader: ({ context, params }) => context.queryClient.ensureQueryData(orderDetailQuery(params.orderId)),
  pendingComponent: LoadingBlock,
  component: InvoicePage,
})
