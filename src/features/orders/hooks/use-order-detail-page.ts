import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useCan } from '@/features/auth/hooks/use-permission'
import { describeError } from '@/lib/api/errors'
import { PERMISSIONS } from '@/lib/permissions'
import { orderService } from '../order.service'
import { orderDetailQuery, orderKeys } from '../queries'

const route = getRouteApi('/_app/orders/$orderId')

export function useOrderDetailPage() {
  const { orderId } = route.useParams()
  const { data, dataUpdatedAt } = useSuspenseQuery(orderDetailQuery(orderId))
  const canManage = useCan(PERMISSIONS.ordersManage)
  const queryClient = useQueryClient()

  const refund = useMutation({
    mutationFn: (reason?: string) => orderService.refund(orderId, reason),
    onSuccess: async (result) => {
      if ('alreadyRefunded' in result) toast.info('Đơn này đã được hoàn tiền trước đó')
      else toast.success(result.status === 'pending' ? 'Stripe đang xử lý hoàn tiền' : 'Đã hoàn tiền')
      await queryClient.invalidateQueries({ queryKey: orderKeys.all })
    },
    onError: (error) => toast.error(describeError(error)),
  })

  return { ...data, version: dataUpdatedAt, canManage, refund }
}
