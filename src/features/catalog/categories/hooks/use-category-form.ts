import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { z } from 'zod'
import { useAppForm } from '@/components/form/form-hook'
import { describeError } from '@/lib/api/errors'
import { emptyToNull, emptyToUndefined } from '@/lib/format'
import { categoryService } from '../category.service'
import { categoryKeys } from '../queries'
import type { Category, CategoryFormValues } from '../types'

/** Mirrors CategoryWriteDto limits. */
const categorySchema = z.object({
  slug: z.string().trim().min(1, 'Nhập slug').max(255),
  nameJa: z.string().trim().min(1, 'Bắt buộc').max(2000),
  nameEn: z.string().trim().min(1, 'Bắt buộc').max(2000),
  descriptionJa: z.string().max(10000),
  descriptionEn: z.string().max(10000),
  position: z.number().int().min(0).optional(),
})

function toFormValues(category?: Category): CategoryFormValues {
  return {
    slug: category?.slug ?? '',
    nameJa: category?.name_ja ?? '',
    nameEn: category?.name_en ?? '',
    descriptionJa: category?.description_ja ?? '',
    descriptionEn: category?.description_en ?? '',
    position: category?.position,
  }
}

/** Create omits empty descriptions; update sends null to clear them. */
function toPayload(values: CategoryFormValues, isUpdate: boolean) {
  const description = isUpdate ? emptyToNull : emptyToUndefined
  return {
    slug: values.slug,
    nameJa: values.nameJa,
    nameEn: values.nameEn,
    descriptionJa: description(values.descriptionJa),
    descriptionEn: description(values.descriptionEn),
    position: values.position,
  }
}

export function useCategoryForm(category: Category | undefined, onDone: () => void) {
  const queryClient = useQueryClient()
  const save = useMutation({
    mutationFn: (values: CategoryFormValues) =>
      category
        ? categoryService.update(category.id, toPayload(values, true))
        : categoryService.create(toPayload(values, false)),
    onSuccess: async () => {
      toast.success(category ? 'Đã cập nhật danh mục' : 'Đã tạo danh mục')
      await queryClient.invalidateQueries({ queryKey: categoryKeys.all })
      onDone()
    },
    onError: (error) => toast.error(describeError(error)),
  })

  const form = useAppForm({
    defaultValues: toFormValues(category),
    validators: { onSubmit: categorySchema },
    onSubmit: ({ value }) => save.mutateAsync(value).catch(() => undefined),
  })

  return { form, isEdit: Boolean(category) }
}
