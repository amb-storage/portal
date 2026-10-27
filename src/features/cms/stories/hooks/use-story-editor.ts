import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAppForm } from '@/components/form/form-hook'
import { describeError } from '@/lib/api/errors'
import { emptyToNull } from '@/lib/format'
import type { DraftFormValues } from '@/features/cms/pages/draft-values'
import { storyService } from '../story.service'
import { storyKeys } from '../queries'
import type { StoryDetail } from '../types'

const EMPTY_CONTENT = { schemaVersion: 1, sections: [] }

/**
 * PATCH /stories/:id with titles, SEO and the complete content document. The API keeps an
 * unpublished Story private and republishes a published one in the same request.
 */
export function useStoryEditor(story: StoryDetail) {
  const queryClient = useQueryClient()
  const save = useMutation({
    mutationFn: (values: DraftFormValues) =>
      storyService.update(story.id, {
        titleJa: emptyToNull(values.titleJa),
        titleEn: emptyToNull(values.titleEn),
        seoTitleJa: emptyToNull(values.seoTitleJa),
        seoTitleEn: emptyToNull(values.seoTitleEn),
        seoDescriptionJa: emptyToNull(values.seoDescriptionJa),
        seoDescriptionEn: emptyToNull(values.seoDescriptionEn),
        content: JSON.parse(values.content) as Record<string, unknown>,
      }),
    onSuccess: async (updated) => {
      toast.success(updated.status === 'PUBLISHED' ? 'Đã lưu và cập nhật lên website' : 'Đã lưu bài viết')
      queryClient.setQueryData(storyKeys.detail(story.id), updated)
      await queryClient.invalidateQueries({ queryKey: [...storyKeys.all, 'list'] })
    },
    onError: (error) => toast.error(describeError(error)),
  })

  const defaultValues: DraftFormValues = {
    titleJa: story.titleJa ?? '',
    titleEn: story.titleEn ?? '',
    seoTitleJa: story.seoTitleJa ?? '',
    seoTitleEn: story.seoTitleEn ?? '',
    seoDescriptionJa: story.seoDescriptionJa ?? '',
    seoDescriptionEn: story.seoDescriptionEn ?? '',
    effectiveAt: '',
    content: JSON.stringify(story.content ?? EMPTY_CONTENT, null, 2),
  }

  return useAppForm({
    defaultValues,
    onSubmit: ({ value }) => save.mutateAsync(value).catch(() => undefined),
  })
}
