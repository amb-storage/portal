import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { z } from 'zod'
import { useAppForm } from '@/components/form/form-hook'
import { describeError } from '@/lib/api/errors'
import { cmsPageService } from '../cms-page.service'
import { cmsPageKeys } from '../queries'
import { PAGE_TYPES, type PageType } from '../types'

const schema = z.object({ slug: z.string().trim().min(1, 'Nhập slug').max(255), type: z.enum(PAGE_TYPES) })

export function useCreatePageForm() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const create = useMutation({
    mutationFn: cmsPageService.create,
    onSuccess: async (page) => {
      toast.success('Đã tạo trang kèm bản nháp')
      await queryClient.invalidateQueries({ queryKey: cmsPageKeys.all })
      await navigate({ to: '/cms/pages/$pageId', params: { pageId: page.id } })
    },
    onError: (error) => toast.error(describeError(error)),
  })

  return useAppForm({
    defaultValues: { slug: '', type: 'STANDARD' as PageType },
    validators: { onSubmit: schema },
    onSubmit: ({ value }) => create.mutateAsync(value).catch(() => undefined),
  })
}
