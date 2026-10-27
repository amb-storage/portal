import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { z } from 'zod'
import { useAppForm } from '@/components/form/form-hook'
import { describeError } from '@/lib/api/errors'
import { storyService } from '../story.service'
import { storyKeys } from '../queries'
import type { StoryDetail } from '../types'

/** PATCH /stories/:id { slug } — the article's URL on the website (/blog/<slug>). */
export function useStorySettingsForm(story: StoryDetail) {
  const queryClient = useQueryClient()
  const save = useMutation({
    mutationFn: (slug: string) => storyService.update(story.id, { slug }),
    onSuccess: async (updated) => {
      toast.success('Đã đổi slug')
      queryClient.setQueryData(storyKeys.detail(story.id), updated)
      await queryClient.invalidateQueries({ queryKey: [...storyKeys.all, 'list'] })
    },
    onError: (error) => toast.error(describeError(error)),
  })
  return useAppForm({
    defaultValues: { slug: story.slug },
    validators: { onSubmit: z.object({ slug: z.string().trim().min(1, 'Nhập slug').max(255) }) },
    onSubmit: ({ value }) => save.mutateAsync(value.slug.trim()).catch(() => undefined),
  })
}
