import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { usePermissions } from '@/features/auth/hooks/use-permission'
import { cmsPublishChecklist } from '@/features/cms/editor/publish-checklist'
import { describeError } from '@/lib/api/errors'
import { PERMISSIONS } from '@/lib/permissions'
import { cmsPageService } from '../cms-page.service'
import { cmsPageKeys, pageDetailQuery, pageDraftQuery } from '../queries'
import type { CmsDetailTab } from '../search'
import type { PreviewToken } from '../types'
import { usePageProfile } from './use-page-profile'

type Action = 'publish' | 'unpublish' | 'archive'

export interface CmsPageDetailOptions {
  pageId: string
  tab: CmsDetailTab
  onTabChange: (tab: CmsDetailTab) => void
}

/** Route-agnostic: the generic Pages, About and Policy screens each bind their own params/search. */
export function useCmsPageDetailPage({ pageId, tab, onTabChange }: CmsPageDetailOptions) {
  const { data: page } = useSuspenseQuery(pageDetailQuery(pageId))
  const draft = useQuery({ ...pageDraftQuery(pageId), enabled: page.status === 'ACTIVE' })
  const { can } = usePermissions()
  const queryClient = useQueryClient()
  const [preview, setPreview] = useState<PreviewToken | null>(null)
  const profile = usePageProfile(page)
  // Fixed ABOUT/POLICY drafts are edited via content-pages; the page draft query still reflects them.
  const checklist = draft.data ? cmsPublishChecklist(draft.data, profile) : []

  const refresh = () => queryClient.invalidateQueries({ queryKey: cmsPageKeys.detail(pageId) })

  const lifecycle = useMutation({
    mutationFn: async (action: Action) => {
      if (action !== 'publish') return cmsPageService[action](pageId)
      // Publish is CAS-guarded: always send the latest draft identity.
      const current = await queryClient.fetchQuery({ ...pageDraftQuery(pageId), staleTime: 0 })
      return cmsPageService.publish(pageId, { draftVersionId: current.id, expectedRevision: current.revision })
    },
    onSuccess: async (_, action) => {
      toast.success({ publish: 'Đã xuất bản trang', unpublish: 'Đã huỷ xuất bản', archive: 'Đã lưu trữ trang' }[action])
      await queryClient.invalidateQueries({ queryKey: cmsPageKeys.all })
    },
    onError: (error) => toast.error(describeError(error)),
  })

  const issuePreview = useMutation({
    mutationFn: () => cmsPageService.previewToken(pageId),
    onSuccess: setPreview,
    onError: (error) => toast.error(describeError(error)),
  })

  const isActive = page.status === 'ACTIVE'
  return {
    page, draft, tab, refresh, lifecycle, issuePreview, preview, setPreview, checklist,
    ready: checklist.every((item) => item.done),
    setTab: (next: string) => onTabChange(next as CmsDetailTab),
    canEdit: can(PERMISSIONS.pageEdit) && isActive,
    canPublish: can(PERMISSIONS.pagePublish) && isActive,
    canPreview: can(PERMISSIONS.pagePreview) && isActive,
  }
}
