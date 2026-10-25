import { Link } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/common/page-header'
import { ErrorAlert } from '@/components/common/query-state'
import { DataTable } from '@/components/data-table/data-table'
import { DataTablePagination } from '@/components/data-table/data-table-pagination'
import { LIST_LIMIT } from '@/lib/search'
import { productColumns } from '../components/products-columns'
import { ProductsToolbar } from '../components/products-toolbar'
import { useProductsPage } from '../hooks/use-products-page'

export function ProductsPage() {
  const { search, setSearch, list, canManage, categoryOptions, openProduct } = useProductsPage()

  return (
    <>
      <PageHeader
        title="Sản phẩm"
        description="Quản lý giá, tồn kho, ảnh và trạng thái đăng bán."
        actions={
          canManage ? (
            <Button asChild>
              <Link to="/catalog/products/new">
                <Plus /> Thêm sản phẩm
              </Link>
            </Button>
          ) : null
        }
      />
      <ProductsToolbar search={search} setSearch={setSearch} categoryOptions={categoryOptions} />
      <ErrorAlert error={list.error} />
      <DataTable
        columns={productColumns}
        data={list.data?.items}
        isLoading={list.isPending}
        getRowId={(row) => row.id}
        onRowClick={(row) => openProduct(row.id)}
        emptyMessage="Chưa có sản phẩm nào."
      />
      <DataTablePagination page={search.page} limit={LIST_LIMIT} total={list.data?.total} onPageChange={(page) => setSearch({ page })} />
    </>
  )
}
