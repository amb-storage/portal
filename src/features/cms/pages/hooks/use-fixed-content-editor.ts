import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAppForm } from '@/components/form/form-hook'
import { describeError } from '@/lib/api/errors'
import { cmsPageService } from '../cms-page.service'
import { cmsPageKeys } from '../queries'
import { toDraftPayload, toDraftValues, type DraftFormValues } from '../draft-values'
import type { FixedContent } from '../types'

/** ABOUT/POLICY drafts go through PUT /cms/content-pages/:pageId (profile validator). */
export function useFixedContentEditor(pageId: string, fixed: FixedContent) {
  const queryClient = useQueryClient()
  const save = useMutation({
    mutationFn: (values: DraftFormValues) =>
      cmsPageService.updateFixed(pageId, {
        draftVersionId: fixed.draftVersionId,
        expectedRevision: fixed.expectedRevision,
        ...toDraftPayload(values),
      }),
    onSuccess: async (updated) => {
      toast.success('Đã lưu nội dung')
      queryClient.setQueryData(cmsPageKeys.fixed(pageId), updated)
      await queryClient.invalidateQueries({ queryKey: cmsPageKeys.detail(pageId) })
    },
    onError: (error) => toast.error(describeError(error)),
  })

  return useAppForm({
    defaultValues: toDraftValues(fixed),
    onSubmit: ({ value }) => save.mutateAsync(value).catch(() => undefined),
  })
}
