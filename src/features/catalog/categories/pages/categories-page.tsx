import { useMemo } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/common/page-header'
import { ErrorAlert } from '@/components/common/query-state'
import { DataTable } from '@/components/data-table/data-table'
import { DataTablePagination } from '@/components/data-table/data-table-pagination'
import { LIST_LIMIT } from '@/lib/search'
import { buildCategoryColumns } from '../components/categories-columns'
import { CategoryFormDialog } from '../components/category-form-dialog'
import { useCategoriesPage } from '../hooks/use-categories-page'

export function CategoriesPage() {
  const { search, setSearch, list, remove, canManage, editor, setEditor } = useCategoriesPage()
  const removeCategory = remove.mutate
  const columns = useMemo(
    () => buildCategoryColumns({ canManage, onEdit: setEditor, onDelete: (id) => removeCategory(id) }),
    [canManage, setEditor, removeCategory],
  )

  return (
    <>
      <PageHeader
        title="Danh mục"
        description="Sắp xếp theo thứ tự hiển thị. Sản phẩm muốn đăng bán cần ít nhất một danh mục."
        actions={
          canManage ? (
            <Button onClick={() => setEditor('new')}>
              <Plus /> Thêm danh mục
            </Button>
          ) : null
        }
      />
      <ErrorAlert error={list.error} />
      <DataTable columns={columns} data={list.data?.items} isLoading={list.isPending} getRowId={(row) => row.id} />
      <DataTablePagination page={search.page} limit={LIST_LIMIT} total={list.data?.total} onPageChange={(page) => setSearch({ page })} />
      {editor ? <CategoryFormDialog category={editor === 'new' ? undefined : editor} onClose={() => setEditor(null)} /> : null}
    </>
  )
}
