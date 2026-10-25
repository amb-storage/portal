import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'
import { useCan } from '@/features/auth/hooks/use-permission'
import { useListSearch } from '@/hooks/use-list-search'
import { describeError } from '@/lib/api/errors'
import { PERMISSIONS } from '@/lib/permissions'
import { LIST_LIMIT } from '@/lib/search'
import { storyService } from '../story.service'
import { storyKeys, storyListQuery } from '../queries'
import type { StorySearch } from '../search'

export function useStoriesPage() {
  const { search, setSearch } = useListSearch<StorySearch>()
  const canManage = useCan(PERMISSIONS.storyManage)
  const queryClient = useQueryClient()
  const [creating, setCreating] = useState(false)
  const list = useQuery(storyListQuery({ ...search, limit: LIST_LIMIT }))

  const remove = useMutation({
    mutationFn: storyService.remove,
    onSuccess: async () => {
      toast.success('Đã xoá bài viết')
      await queryClient.invalidateQueries({ queryKey: storyKeys.all })
    },
    onError: (error) => toast.error(describeError(error)),
  })

  const navigate = useNavigate()
  const openStory = (pageId: string) => navigate({ to: '/cms/pages/$pageId', params: { pageId } })
  return { search, setSearch, list, canManage, creating, setCreating, remove, openStory }
}
