import { createFileRoute } from '@tanstack/react-router'
import { OrdersPage } from '@/features/orders/pages/orders-page'
import { orderSearchSchema } from '@/features/orders/search'

export const Route = createFileRoute('/_app/orders/')({
  staticData: { crumb: { title: 'Đơn hàng' } },
  validateSearch: orderSearchSchema,
  component: OrdersPage,
})
