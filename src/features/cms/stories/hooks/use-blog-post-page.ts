import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'
import { cmsPublishChecklist } from '@/features/cms/editor/publish-checklist'
import { useCan } from '@/features/auth/hooks/use-permission'
import { describeError } from '@/lib/api/errors'
import { PERMISSIONS } from '@/lib/permissions'
import { blogKeys, blogPostQuery } from '../blog.queries'
import { blogService } from '../blog.service'
import type { BlogPreview } from '../blog.types'

type Action = 'publish' | 'unpublish' | 'archive'

export function useBlogPostPage(postId: string) {
  const { data: post } = useSuspenseQuery(blogPostQuery(postId))
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const canManage = useCan(PERMISSIONS.blogManage)
  const [preview, setPreview] = useState<BlogPreview | null>(null)
  const lifecycle = useMutation({
    mutationFn: async (action: Action) => {
      if (action === 'unpublish') return blogService.unpublish(postId)
      if (action === 'archive') return blogService.archive(postId)
      const current = await queryClient.fetchQuery({ ...blogPostQuery(postId), staleTime: 0 })
      if (!current.draft) throw new Error('Bài viết không có bản nháp để xuất bản')
      return blogService.publish(postId, { draftVersionId: current.draft.id, expectedRevision: current.draft.revision })
    },
    onSuccess: async (_, action) => {
      toast.success({ publish: 'Đã xuất bản bài viết', unpublish: 'Đã huỷ xuất bản bài viết', archive: 'Đã lưu trữ bài viết' }[action])
      await queryClient.invalidateQueries({ queryKey: blogKeys.all })
      if (action === 'archive') await navigate({ to: '/cms/stories' })
    },
    onError: (error) => toast.error(describeError(error)),
  })
  const issuePreview = useMutation({
    mutationFn: () => blogService.preview(postId),
    onSuccess: setPreview,
    onError: (error) => toast.error(describeError(error)),
  })
  const updateSlug = useMutation({
    mutationFn: (slug: string) => blogService.update(postId, { slug }),
    onSuccess: async (updated) => {
      toast.success('Đã cập nhật slug')
      queryClient.setQueryData(blogKeys.detail(postId), updated)
      await queryClient.invalidateQueries({ queryKey: blogKeys.all })
    },
    onError: (error) => toast.error(describeError(error)),
  })
  const checklist = post.draft ? cmsPublishChecklist(post.draft, 'MILI_TALK_ARTICLE') : []
  return {
    post,
    canManage,
    checklist,
    ready: checklist.length > 0 && checklist.every((item) => item.done),
    lifecycle,
    issuePreview,
    preview,
    setPreview,
    updateSlug,
  }
}
