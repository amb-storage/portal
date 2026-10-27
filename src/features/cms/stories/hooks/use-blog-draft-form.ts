import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAppForm } from '@/components/form/form-hook'
import { describeError } from '@/lib/api/errors'
import { blogKeys } from '../blog.queries'
import { blogService } from '../blog.service'
import { toBlogDraftPayload, toBlogDraftValues, type BlogDraftFormValues } from '../blog-draft-values'
import type { BlogPostDraft } from '../blog.types'

export function useBlogDraftForm(postId: string, draft: BlogPostDraft) {
  const queryClient = useQueryClient()
  const save = useMutation({
    mutationFn: (values: BlogDraftFormValues) =>
      blogService.updateDraft(postId, {
        draftVersionId: draft.id,
        expectedRevision: draft.revision,
        ...toBlogDraftPayload(values),
      }),
    onSuccess: async (updated) => {
      toast.success('Đã lưu nháp bài viết')
      queryClient.setQueryData(blogKeys.detail(postId), updated)
      await queryClient.invalidateQueries({ queryKey: blogKeys.all })
    },
    onError: (error) => toast.error(describeError(error)),
  })

  return useAppForm({
    defaultValues: toBlogDraftValues(draft),
    onSubmit: ({ value }) => save.mutateAsync(value).catch(() => undefined),
  })
}

export type BlogDraftForm = ReturnType<typeof useBlogDraftForm>
