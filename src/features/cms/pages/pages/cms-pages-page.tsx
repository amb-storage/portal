import { useMemo } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FilterSelect, ListToolbar, SearchInput } from '@/components/common/list-toolbar'
import { PageHeader } from '@/components/common/page-header'
import { ErrorAlert } from '@/components/common/query-state'
import { DataTable } from '@/components/data-table/data-table'
import { DataTablePagination } from '@/components/data-table/data-table-pagination'
import { LIST_LIMIT } from '@/lib/search'
import { CreatePageDialog } from '../components/create-page-dialog'
import { buildPageColumns } from '../components/pages-columns'
import { useCmsPagesPage } from '../hooks/use-cms-pages-page'
import type { CmsPageSearch } from '../search'
import { BUILDER_PAGE_TYPES, PAGE_STATUSES } from '../types'

export function CmsPagesPage() {
  const { search, setSearch, list, canEdit, creating, setCreating, openPage, remove } = useCmsPagesPage()
  const removePage = remove.mutate
  const columns = useMemo(() => buildPageColumns({ canDelete: canEdit, onDelete: (id) => removePage(id) }), [canEdit, removePage])

  return (
    <>
      <PageHeader
        title="Trang"
        description="Các trang dựng bằng khối (trang chủ, trang thường, landing). Giới thiệu và Chính sách quản lý ở mục riêng."
        actions={canEdit ? <Button onClick={() => setCreating(true)}><Plus /> Thêm trang</Button> : null}
      />
      <ListToolbar>
        <SearchInput value={search.q} onChange={(q) => setSearch({ q })} placeholder="Tìm theo slug…" />
        <FilterSelect value={search.type} onChange={(type) => setSearch({ type: type as CmsPageSearch['type'] })} options={BUILDER_PAGE_TYPES} placeholder="Mọi loại" />
        <FilterSelect value={search.status} onChange={(status) => setSearch({ status: status as CmsPageSearch['status'] })} options={PAGE_STATUSES} placeholder="Mọi trạng thái" />
      </ListToolbar>
      <ErrorAlert error={list.error} />
      <DataTable
        columns={columns}
        data={list.data?.items}
        isLoading={list.isPending}
        getRowId={(row) => row.id}
        onRowClick={(row) => openPage(row.id)}
      />
      <DataTablePagination page={search.page} limit={LIST_LIMIT} total={list.data?.total} onPageChange={(page) => setSearch({ page })} />
      {creating ? <CreatePageDialog onClose={() => setCreating(false)} /> : null}
    </>
  )
}
