import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/common/page-header'
import { ErrorAlert } from '@/components/common/query-state'
import { DataTable } from '@/components/data-table/data-table'
import { useCan } from '@/features/auth/hooks/use-permission'
import { PERMISSIONS } from '@/lib/permissions'
import { CreatePageDialog } from '../components/create-page-dialog'
import { buildPageColumns } from '../components/pages-columns'
import { useDeletePage } from '../hooks/use-delete-page'
import { pageListQuery } from '../queries'

/** Policy pages (shipping, returns, privacy…) on their own screen, with add/edit/delete. */
export function PoliciesPage() {
  const canEdit = useCan(PERMISSIONS.pageEdit)
  const [creating, setCreating] = useState(false)
  const navigate = useNavigate()
  const list = useQuery(pageListQuery({ page: 1, limit: 100, type: 'POLICY', status: 'ACTIVE' }))
  const remove = useDeletePage()
  const removePage = remove.mutate
  const columns = useMemo(() => buildPageColumns({ canDelete: canEdit, onDelete: (id) => removePage(id), showType: false }), [canEdit, removePage])

  return (
    <>
      <PageHeader
        title="Chính sách"
        description="Chính sách giao hàng, đổi trả, bảo mật… Mỗi trang có nội dung tiếng Nhật và tiếng Anh, cần ngày hiệu lực khi xuất bản."
        actions={canEdit ? <Button onClick={() => setCreating(true)}><Plus /> Thêm chính sách</Button> : null}
      />
      <ErrorAlert error={list.error} />
      <DataTable
        columns={columns}
        data={list.data?.items}
        isLoading={list.isPending}
        getRowId={(row) => row.id}
        onRowClick={(row) => navigate({ to: '/cms/pages/$pageId', params: { pageId: row.id } })}
        emptyMessage="Chưa có trang chính sách nào."
      />
      {creating ? <CreatePageDialog lockedType="POLICY" onClose={() => setCreating(false)} /> : null}
    </>
  )
}
