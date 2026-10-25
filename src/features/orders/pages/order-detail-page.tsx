import { PageHeader } from '@/components/common/page-header'
import { StatusBadge } from '@/components/common/status-badge'
import { FulfillmentCard } from '../components/fulfillment-card'
import { OrderItemsCard } from '../components/order-items-card'
import { OrderSummaryCard } from '../components/order-summary-card'
import { PaymentEventsCard } from '../components/payment-events-card'
import { RefundDialog } from '../components/refund-dialog'
import { ShippingCard } from '../components/shipping-card'
import { canRefund } from '../fulfillment'
import { useOrderDetailPage } from '../hooks/use-order-detail-page'

export function OrderDetailPage() {
  const { order, items, paymentEvents, version, canManage, refund } = useOrderDetailPage()

  return (
    <>
      <PageHeader
        title={
          <span className="flex items-center gap-3">
            {order.order_number} <StatusBadge status={order.status} />
          </span>
        }
        description={order.email}
        actions={
          canManage ? (
            <RefundDialog disabled={!canRefund(order)} isPending={refund.isPending} onRefund={(reason) => refund.mutate(reason)} />
          ) : null
        }
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="grid content-start gap-6">
          <OrderItemsCard items={items} currency={order.currency} />
          <FulfillmentCard key={version} order={order} canManage={canManage} />
          <ShippingCard snapshot={order.shipping_snapshot} />
        </div>
        <div className="grid content-start gap-6">
          <OrderSummaryCard order={order} />
          <PaymentEventsCard events={paymentEvents} />
        </div>
      </div>
    </>
  )
}
