import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'
import { usePermissions } from '@/features/auth/hooks/use-permission'
import { cmsPublishChecklist } from '@/features/cms/editor/publish-checklist'
import { cmsPageService } from '@/features/cms/pages/cms-page.service'
import type { PreviewToken } from '@/features/cms/pages/types'
import { describeError } from '@/lib/api/errors'
import { PERMISSIONS } from '@/lib/permissions'
import { storyService } from '../story.service'
import { storyDetailQuery, storyKeys } from '../queries'

const route = getRouteApi('/_app/cms/stories/$storyId')

type Action = 'publish' | 'unpublish' | 'remove'

const DONE: Record<Action, string> = {
  publish: 'Đã xuất bản bài viết',
  unpublish: 'Đã gỡ bài khỏi website',
  remove: 'Đã xoá bài viết',
}

export function useStoryDetailPage() {
  const { storyId } = route.useParams()
  const { tab } = route.useSearch()
  const navigate = route.useNavigate()
  const { data: story } = useSuspenseQuery(storyDetailQuery(storyId))
  const { can } = usePermissions()
  const queryClient = useQueryClient()
  const [preview, setPreview] = useState<PreviewToken | null>(null)
  // Same checks the API runs on publish (validateStoryArticlePublication), from the saved content.
  const checklist = cmsPublishChecklist({ titleJa: story.titleJa, titleEn: story.titleEn, effectiveAt: null, content: story.content ?? undefined }, 'MILI_TALK_ARTICLE')

  const lifecycle = useMutation({
    mutationFn: (action: Action) => storyService[action](storyId),
    onSuccess: async (updated, action) => {
      toast.success(DONE[action])
      if (action === 'remove') {
        await queryClient.invalidateQueries({ queryKey: storyKeys.all })
        await navigate({ to: '/cms/stories' })
        return
      }
      queryClient.setQueryData(storyKeys.detail(storyId), updated)
      await queryClient.invalidateQueries({ queryKey: [...storyKeys.all, 'list'] })
    },
    onError: (error) => toast.error(describeError(error)),
  })

  // Preview still uses the page preview token: the Story's draft lives on its page.
  const issuePreview = useMutation({
    mutationFn: () => cmsPageService.previewToken(story.pageId),
    onSuccess: setPreview,
    onError: (error) => toast.error(describeError(error)),
  })

  const isActive = story.pageStatus === 'ACTIVE'
  return {
    story,
    tab,
    setTab: (next: string) => navigate({ search: { tab: next as typeof tab }, replace: true }),
    lifecycle,
    issuePreview,
    preview,
    setPreview,
    checklist,
    ready: checklist.every((item) => item.done),
    canManage: can(PERMISSIONS.storyManage) && isActive,
    canPreview: can(PERMISSIONS.pagePreview) && isActive,
  }
}
