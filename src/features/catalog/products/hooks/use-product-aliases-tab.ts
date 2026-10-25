import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { z } from 'zod'
import { useAppForm } from '@/components/form/form-hook'
import { describeError } from '@/lib/api/errors'
import { productService } from '../product.service'

/** The API only exposes alias creation; there is no listing endpoint. */
export function useProductAliasesTab(productId: string) {
  const add = useMutation({
    mutationFn: (slug: string) => productService.addAlias(productId, slug),
    onSuccess: ({ slug }) => toast.success(`Đã thêm alias "${slug}"`),
    onError: (error) => toast.error(describeError(error)),
  })

  const form = useAppForm({
    defaultValues: { slug: '' },
    validators: { onSubmit: z.object({ slug: z.string().trim().min(1, 'Nhập slug').max(255) }) },
    onSubmit: async ({ value, formApi }) => {
      await add.mutateAsync(value.slug).then(() => formApi.reset()).catch(() => undefined)
    },
  })

  return { form, added: add.data }
}
