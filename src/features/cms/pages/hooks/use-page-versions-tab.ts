import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { describeError } from '@/lib/api/errors'
import { cmsPageService } from '../cms-page.service'
import { cmsPageKeys, pageVersionsQuery } from '../queries'

const LIMIT = 20

export function usePageVersionsTab(pageId: string) {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [viewing, setViewing] = useState<string | null>(null)
  const versions = useQuery(pageVersionsQuery(pageId, page, LIMIT))
  const count = versions.data?.items.length ?? 0
  // The versions endpoint has no total; allow "next" while pages are full.
  const total = (page - 1) * LIMIT + count + (count === LIMIT ? 1 : 0)

  const rollback = useMutation({
    mutationFn: (versionId: string) => cmsPageService.rollback(pageId, versionId),
    onSuccess: async () => {
      toast.success('Đã khôi phục: xuất bản lại phiên bản và tạo bản nháp mới')
      await queryClient.invalidateQueries({ queryKey: cmsPageKeys.all })
    },
    onError: (error) => toast.error(describeError(error)),
  })

  return { versions, page, setPage, limit: LIMIT, total, rollback, viewing, setViewing }
}
