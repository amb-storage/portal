import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { z } from 'zod'
import { useAppForm } from '@/components/form/form-hook'
import { describeError, isApiError } from '@/lib/api/errors'
import { productService } from '../product.service'
import { productKeys } from '../queries'
import type { StockAdjustmentInput } from '../types'

/** Mirrors StockAdjustmentDto. */
const stockSchema = z.object({
  delta: z
    .number()
    .int()
    .min(-1_000_000)
    .max(1_000_000)
    .optional()
    .refine((value) => value !== undefined && value !== 0, 'Nhập số lượng thay đổi (khác 0)'),
  reason: z.string().trim().min(1, 'Nhập lý do').max(255),
})

function describeStockError(error: unknown) {
  if (isApiError(error) && error.code === 'PRODUCT_STOCK_RESERVED_CONFLICT')
    return 'Đang có đơn chờ thanh toán giữ nhiều hơn số lượng còn lại sau khi điều chỉnh.'
  if (isApiError(error) && error.code === 'PRODUCT_STOCK_NEGATIVE') return 'Tồn kho không được âm.'
  return describeError(error)
}

/** Audited, reasoned stock change via POST /products/:id/stock-adjustments. */
export function useProductStockTab(productId: string) {
  const queryClient = useQueryClient()

  const adjust = useMutation({
    mutationFn: (input: StockAdjustmentInput) => productService.adjustStock(productId, input),
    onSuccess: async ({ product }) => {
      toast.success(`Tồn kho hiện tại: ${product.quantity ?? 0}`)
      queryClient.setQueryData(productKeys.detail(productId), product)
      await queryClient.invalidateQueries({ queryKey: productKeys.all })
    },
    onError: (error) => toast.error(describeStockError(error)),
  })

  const form = useAppForm({
    defaultValues: { reason: '' } as { delta?: number; reason: string },
    validators: { onSubmit: stockSchema },
    onSubmit: async ({ value, formApi }) => {
      await adjust
        .mutateAsync({ delta: value.delta ?? 0, reason: value.reason.trim() })
        .then(() => formApi.reset())
        .catch(() => undefined)
    },
  })

  return { form }
}
