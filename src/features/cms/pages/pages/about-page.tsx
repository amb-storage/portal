import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/common/page-header'
import { ErrorAlert, LoadingBlock } from '@/components/common/query-state'
import { useCan } from '@/features/auth/hooks/use-permission'
import { PERMISSIONS } from '@/lib/permissions'
import { CreatePageDialog } from '../components/create-page-dialog'
import { pageListQuery } from '../queries'
import { CmsPageDetail } from './cms-page-detail-page'

const route = getRouteApi('/_app/cms/about')

/** There is at most one active ABOUT page: edit it right here, or offer to create it. */
export function AboutPage() {
  const canEdit = useCan(PERMISSIONS.pageEdit)
  const [creating, setCreating] = useState(false)
  const { tab } = route.useSearch()
  const navigate = route.useNavigate()
  const about = useQuery(pageListQuery({ page: 1, limit: 1, type: 'ABOUT', status: 'ACTIVE' }))
  const page = about.data?.items[0]

  // About has no Settings/Registry tabs.
  if (page) return <CmsPageDetail pageId={page.id} tab={tab === 'versions' ? tab : 'draft'} onTabChange={(next) => navigate({ search: { tab: next }, replace: true })} />
  return (
    <>
      <PageHeader title="Giới thiệu" description="Trang giới thiệu cửa hàng (About)." />
      <ErrorAlert error={about.error} />
      {about.isPending ? (
        <LoadingBlock />
      ) : (
        <div className="grid place-items-center gap-3 rounded-lg border border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">
            Chưa có trang Giới thiệu. Thường trang <code>about</code> được tạo sẵn khi khởi tạo CMS; nếu đã bị xoá thì tạo lại ở đây.
          </p>
          {canEdit ? <Button onClick={() => setCreating(true)}><Plus /> Tạo trang Giới thiệu</Button> : null}
        </div>
      )}
      {creating ? <CreatePageDialog lockedType="ABOUT" onClose={() => setCreating(false)} /> : null}
    </>
  )
}
