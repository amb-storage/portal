import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'
import { useCan } from '@/features/auth/hooks/use-permission'
import { useListSearch } from '@/hooks/use-list-search'
import { describeError } from '@/lib/api/errors'
import { PERMISSIONS } from '@/lib/permissions'
import { LIST_LIMIT } from '@/lib/search'
import { blogService } from '../blog.service'
import { blogKeys, blogListQuery } from '../blog.queries'
import type { StorySearch } from '../search'

export function useStoriesPage() {
  const { search, setSearch } = useListSearch<StorySearch>()
  const canManage = useCan(PERMISSIONS.blogManage)
  const queryClient = useQueryClient()
  const [creating, setCreating] = useState(false)
  const list = useQuery(blogListQuery({ ...search, limit: LIST_LIMIT }))

  const remove = useMutation({
    mutationFn: blogService.archive,
    onSuccess: async () => {
      toast.success('Đã xoá bài viết')
      await queryClient.invalidateQueries({ queryKey: blogKeys.all })
    },
    onError: (error) => toast.error(describeError(error)),
  })

  const navigate = useNavigate()
  const openStory = (postId: string) => navigate({ to: '/cms/stories/$postId', params: { postId } })
  return { search, setSearch, list, canManage, creating, setCreating, remove, openStory }
}
