import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { z } from 'zod'
import { useAppForm } from '@/components/form/form-hook'
import { describeError } from '@/lib/api/errors'
import { productService } from '../product.service'
import { productKeys } from '../queries'
import { toCreatePayload, toFormValues, toUpdatePayload, type ProductFormValues } from '../form-values'
import type { Product } from '../types'

const detailSchema = z.object({
  key: z.string().min(1, 'Nhập mã').max(100),
  labelJa: z.string().min(1, 'Nhập nhãn').max(255),
  labelEn: z.string().min(1, 'Nhập nhãn').max(255),
  valueJa: z.string().max(2000),
  valueEn: z.string().max(2000),
})

const text = (max: number) => z.string().max(max)

const optionalInt = (min: number) => z.number().int().min(min).optional()

/** Mirrors ProductWriteDto limits. Drafts may be incomplete; publish enforces the rest. */
const productSchema = z.object({
  slug: text(255),
  nameJa: text(2000),
  nameEn: text(2000),
  price: optionalInt(1),
  size: text(255),
  quantity: optionalInt(0),
  descriptionJa: text(10000),
  descriptionEn: text(10000),
  conditionJa: text(10000),
  conditionEn: text(10000),
  seoTitleJa: text(5000),
  seoTitleEn: text(5000),
  seoDescriptionJa: text(10000),
  seoDescriptionEn: text(10000),
  categoryIds: z.array(z.string()),
  details: z.array(detailSchema),
  measurementsJa: text(2000),
  measurementsEn: text(2000),
  miliTalkId: z.string(),
})

export function useProductForm(product: Product | undefined, onSaved: (product: Product) => void) {
  const queryClient = useQueryClient()
  const initial = toFormValues(product)

  const save = useMutation({
    mutationFn: (values: ProductFormValues) =>
      product ? productService.update(product.id, toUpdatePayload(values, initial)) : productService.create(toCreatePayload(values)),
    onSuccess: async ({ product: saved }) => {
      toast.success(product ? 'Đã lưu sản phẩm' : 'Đã tạo sản phẩm. Tiếp theo: thêm ảnh.')
      queryClient.setQueryData(productKeys.detail(saved.id), saved)
      await queryClient.invalidateQueries({ queryKey: productKeys.all })
      onSaved(saved)
    },
    onError: (error) => toast.error(describeError(error)),
  })

  const form = useAppForm({
    defaultValues: initial,
    validators: { onSubmit: productSchema },
    onSubmit: ({ value }) => save.mutateAsync(value).catch(() => undefined),
  })

  return { form, isEdit: Boolean(product) }
}

export type ProductForm = ReturnType<typeof useProductForm>['form']
