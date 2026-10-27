import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { z } from 'zod'
import { useAppForm } from '@/components/form/form-hook'
import { describeError } from '@/lib/api/errors'
import { storyService } from '../story.service'
import { storyKeys } from '../queries'

/** Creates an unpublished Story (POST /stories), then opens its editor. */
export function useCreateStoryForm() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const create = useMutation({
    mutationFn: storyService.create,
    onSuccess: async (story) => {
      toast.success('Đã tạo bài viết')
      await queryClient.invalidateQueries({ queryKey: storyKeys.all })
      await navigate({ to: '/cms/stories/$storyId', params: { storyId: story.id } })
    },
    onError: (error) => toast.error(describeError(error)),
  })

  return useAppForm({
    defaultValues: { slug: '' },
    validators: { onSubmit: z.object({ slug: z.string().trim().min(1, 'Nhập slug').max(255) }) },
    onSubmit: ({ value }) => create.mutateAsync({ slug: value.slug.trim() }).catch(() => undefined),
  })
}
