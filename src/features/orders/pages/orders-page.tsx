import { FilterSelect, ListToolbar, SearchInput } from '@/components/common/list-toolbar'
import { PageHeader } from '@/components/common/page-header'
import { ErrorAlert } from '@/components/common/query-state'
import { DataTable } from '@/components/data-table/data-table'
import { DataTablePagination } from '@/components/data-table/data-table-pagination'
import { LIST_LIMIT } from '@/lib/search'
import { orderColumns } from '../components/orders-columns'
import { useOrdersPage } from '../hooks/use-orders-page'
import type { OrderSearch } from '../search'
import { FULFILLMENT_STATUSES, ORDER_STATUSES } from '../types'

export function OrdersPage() {
  const { search, setSearch, list, openOrder } = useOrdersPage()

  return (
    <>
      <PageHeader title="Đơn hàng" description="Theo dõi thanh toán, giao hàng và hoàn tiền." />
      <ListToolbar>
        <SearchInput value={search.q} onChange={(q) => setSearch({ q })} placeholder="Mã đơn hoặc email…" />
        <FilterSelect
          value={search.status}
          onChange={(status) => setSearch({ status: status as OrderSearch['status'] })}
          options={ORDER_STATUSES}
          placeholder="Mọi trạng thái thanh toán"
        />
        <FilterSelect
          value={search.fulfillmentStatus}
          onChange={(fulfillmentStatus) => setSearch({ fulfillmentStatus: fulfillmentStatus as OrderSearch['fulfillmentStatus'] })}
          options={FULFILLMENT_STATUSES}
          placeholder="Mọi trạng thái giao"
        />
      </ListToolbar>
      <ErrorAlert error={list.error} />
      <DataTable
        columns={orderColumns}
        data={list.data?.items}
        isLoading={list.isPending}
        getRowId={(row) => row.id}
        onRowClick={(row) => openOrder(row.id)}
        emptyMessage="Chưa có đơn hàng nào."
      />
      <DataTablePagination page={search.page} limit={LIST_LIMIT} total={list.data?.total} onPageChange={(page) => setSearch({ page })} />
    </>
  )
}
