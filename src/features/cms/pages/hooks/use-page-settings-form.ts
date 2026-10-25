import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { z } from 'zod'
import { useAppForm } from '@/components/form/form-hook'
import { describeError } from '@/lib/api/errors'
import { cmsPageService } from '../cms-page.service'
import { cmsPageKeys } from '../queries'
import type { CmsPage } from '../types'

export function usePageSettingsForm(page: CmsPage) {
  const queryClient = useQueryClient()
  const patch = useMutation({
    mutationFn: (slug: string) => cmsPageService.patch(page.id, { slug }),
    onSuccess: async () => {
      toast.success('Đã cập nhật slug')
      await queryClient.invalidateQueries({ queryKey: cmsPageKeys.all })
    },
    onError: (error) => toast.error(describeError(error)),
  })

  return useAppForm({
    defaultValues: { slug: page.slug },
    validators: { onSubmit: z.object({ slug: z.string().trim().min(1, 'Nhập slug').max(255) }) },
    onSubmit: ({ value }) => patch.mutateAsync(value.slug).catch(() => undefined),
  })
}
