import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Navigate } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/common/page-header'
import { ErrorAlert, LoadingBlock } from '@/components/common/query-state'
import { useCan } from '@/features/auth/hooks/use-permission'
import { PERMISSIONS } from '@/lib/permissions'
import { CreatePageDialog } from '../components/create-page-dialog'
import { pageListQuery } from '../queries'

/** There is at most one active ABOUT page: open it directly, or offer to create it. */
export function AboutPage() {
  const canEdit = useCan(PERMISSIONS.pageEdit)
  const [creating, setCreating] = useState(false)
  const about = useQuery(pageListQuery({ page: 1, limit: 1, type: 'ABOUT', status: 'ACTIVE' }))
  const page = about.data?.items[0]

  if (page) return <Navigate to="/cms/pages/$pageId" params={{ pageId: page.id }} replace />
  return (
    <>
      <PageHeader title="Giới thiệu" description="Trang giới thiệu cửa hàng (About)." />
      <ErrorAlert error={about.error} />
      {about.isPending ? (
        <LoadingBlock />
      ) : (
        <div className="grid place-items-center gap-3 rounded-lg border border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">Chưa có trang Giới thiệu.</p>
          {canEdit ? <Button onClick={() => setCreating(true)}><Plus /> Tạo trang Giới thiệu</Button> : null}
        </div>
      )}
      {creating ? <CreatePageDialog lockedType="ABOUT" onClose={() => setCreating(false)} /> : null}
    </>
  )
}
