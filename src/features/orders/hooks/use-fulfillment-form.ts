import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { z } from 'zod'
import { useAppForm } from '@/components/form/form-hook'
import { describeError } from '@/lib/api/errors'
import { orderService } from '../order.service'
import { orderKeys } from '../queries'
import { FULFILLMENT_STATUSES, type Order, type OrderUpdateInput } from '../types'

/** Mirrors OrderUpdateDto limits. */
const fulfillmentSchema = z.object({
  fulfillmentStatus: z.enum(FULFILLMENT_STATUSES),
  carrier: z.string().max(128),
  trackingNumber: z.string().max(255),
  internalNote: z.string().max(5000),
})

type FulfillmentValues = z.infer<typeof fulfillmentSchema>

function toFormValues(order: Order): FulfillmentValues {
  return {
    fulfillmentStatus: order.fulfillment_status,
    carrier: order.carrier ?? '',
    trackingNumber: order.tracking_number ?? '',
    internalNote: order.internal_note ?? '',
  }
}

/** Sends only changed fields; cleared text becomes null. */
function toPayload(values: FulfillmentValues, initial: FulfillmentValues): OrderUpdateInput {
  const payload: OrderUpdateInput = {}
  if (values.fulfillmentStatus !== initial.fulfillmentStatus) payload.fulfillmentStatus = values.fulfillmentStatus
  for (const key of ['carrier', 'trackingNumber', 'internalNote'] as const) {
    if (values[key] !== initial[key]) payload[key] = values[key].trim() ? values[key] : null
  }
  return payload
}

/** Key the consumer by query dataUpdatedAt so values re-initialize after each save. */
export function useFulfillmentForm(order: Order) {
  const queryClient = useQueryClient()
  const initial = toFormValues(order)

  const save = useMutation({
    mutationFn: (values: FulfillmentValues) => orderService.update(order.id, toPayload(values, initial)),
    onSuccess: async () => {
      toast.success('Đã cập nhật đơn hàng')
      await queryClient.invalidateQueries({ queryKey: orderKeys.all })
    },
    onError: (error) => toast.error(describeError(error)),
  })

  return useAppForm({
    defaultValues: initial,
    validators: { onSubmit: fulfillmentSchema },
    onSubmit: ({ value }) => save.mutateAsync(value).catch(() => undefined),
  })
}
