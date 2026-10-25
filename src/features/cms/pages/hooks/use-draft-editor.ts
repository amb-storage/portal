import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAppForm } from '@/components/form/form-hook'
import { describeError } from '@/lib/api/errors'
import { cmsPageService } from '../cms-page.service'
import { cmsPageKeys } from '../queries'
import { toDraftPayload, toDraftValues, type DraftFormValues } from '../draft-values'
import type { PageVersion } from '../types'

/** PUT /pages/:id/draft with draftVersionId + expectedRevision (optimistic CAS). */
export function useDraftEditor(pageId: string, draft: PageVersion) {
  const queryClient = useQueryClient()
  const save = useMutation({
    mutationFn: (values: DraftFormValues) =>
      cmsPageService.updateDraft(pageId, {
        draftVersionId: draft.id,
        expectedRevision: draft.revision,
        ...toDraftPayload(values),
      }),
    onSuccess: async (updated) => {
      toast.success('Đã lưu nháp')
      queryClient.setQueryData(cmsPageKeys.draft(pageId), updated)
      await queryClient.invalidateQueries({ queryKey: cmsPageKeys.detail(pageId) })
    },
    onError: (error) => toast.error(describeError(error)),
  })

  return useAppForm({
    defaultValues: toDraftValues(draft),
    onSubmit: ({ value }) => save.mutateAsync(value).catch(() => undefined),
  })
}

export type DraftForm = ReturnType<typeof useDraftEditor>
