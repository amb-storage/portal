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

/** `lockedType` pre-selects and fixes the type (e.g. the Policies screen). */
export function useCreatePageForm(lockedType?: PageType) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const create = useMutation({
    mutationFn: cmsPageService.create,
    onSuccess: async (page) => {
      toast.success('Đã tạo trang kèm bản nháp')
      await queryClient.invalidateQueries({ queryKey: cmsPageKeys.all })
      if (page.type === 'ABOUT') await navigate({ to: '/cms/about' })
      else if (page.type === 'POLICY') await navigate({ to: '/cms/policies/$pageId', params: { pageId: page.id } })
      else await navigate({ to: '/cms/pages/$pageId', params: { pageId: page.id } })
    },
    onError: (error) => toast.error(describeError(error)),
  })

  return useAppForm({
    defaultValues: { slug: '', type: lockedType ?? ('STANDARD' as PageType) },
    validators: { onSubmit: schema },
    onSubmit: ({ value }) => create.mutateAsync(value).catch(() => undefined),
  })
}
