import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { Plus, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfirmButton } from '@/components/common/confirm-button'
import { PageHeader } from '@/components/common/page-header'
import { ErrorAlert } from '@/components/common/query-state'
import { DataTable } from '@/components/data-table/data-table'
import { useCan } from '@/features/auth/hooks/use-permission'
import { PERMISSIONS } from '@/lib/permissions'
import { CreatePageDialog } from '../components/create-page-dialog'
import { buildPageColumns } from '../components/pages-columns'
import { PolicyWebsiteOrder } from '../components/policy-website-order'
import { useDeletePage } from '../hooks/use-delete-page'
import { useSeedPolicies } from '../hooks/use-seed-policies'
import { POLICY_TEMPLATES } from '../policy-template'
import { pageListQuery } from '../queries'

/** Policy pages (shipping, returns, privacy…) on their own screen, with add/edit/delete. */
export function PoliciesPage() {
  const canEdit = useCan(PERMISSIONS.pageEdit)
  const [creating, setCreating] = useState(false)
  const navigate = useNavigate()
  const list = useQuery(pageListQuery({ page: 1, limit: 100, type: 'POLICY', status: 'ACTIVE' }))
  const remove = useDeletePage()
  const seed = useSeedPolicies(list.data?.items)
  const removePage = remove.mutate
  const columns = useMemo(() => buildPageColumns({ canDelete: canEdit, onDelete: (id) => removePage(id), variant: 'policies' }), [canEdit, removePage])

  return (
    <>
      <PageHeader
        title="Chính sách"
        description="Chính sách giao hàng, đổi trả, bảo mật… Mỗi trang có nội dung tiếng Nhật và tiếng Anh, cần ngày hiệu lực khi xuất bản. Website gộp mọi chính sách đã xuất bản vào trang /policy, sắp theo slug (A→Z)."
        actions={
          canEdit ? (
            <>
              <ConfirmButton
                variant="outline"
                disabled={list.isPending || seed.isPending}
                title="Tạo chính sách theo amb-storage.com?"
                description={
                  <>
                    Tạo các trang còn thiếu ({POLICY_TEMPLATES.map((template) => template.slug).join(', ')}) và điền nội dung mẫu vào bản nháp của những trang chưa
                    chia mục. Trang đã chia mục giữ nguyên. Chưa có gì được xuất bản: mở từng trang để kiểm tra rồi bấm Xuất bản.
                  </>
                }
                confirmLabel="Tạo nội dung mẫu"
                onConfirm={() => seed.mutate()}
              >
                <Sparkles /> Nội dung mẫu
              </ConfirmButton>
              <Button onClick={() => setCreating(true)}><Plus /> Thêm chính sách</Button>
            </>
          ) : null
        }
      />
      <ErrorAlert error={list.error} />
      <DataTable
        columns={columns}
        data={list.data?.items}
        isLoading={list.isPending}
        getRowId={(row) => row.id}
        onRowClick={(row) => navigate({ to: '/cms/policies/$pageId', params: { pageId: row.id } })}
        emptyMessage="Chưa có trang chính sách nào."
      />
      {list.data ? <PolicyWebsiteOrder pages={list.data.items} /> : null}
      {creating ? <CreatePageDialog lockedType="POLICY" onClose={() => setCreating(false)} /> : null}
    </>
  )
}
