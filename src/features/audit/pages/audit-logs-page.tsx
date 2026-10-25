import { Button } from '@/components/ui/button'
import { ListToolbar, SearchInput } from '@/components/common/list-toolbar'
import { PageHeader } from '@/components/common/page-header'
import { ErrorAlert } from '@/components/common/query-state'
import { DataTable } from '@/components/data-table/data-table'
import { auditColumns } from '../components/audit-columns'
import { AuditDetailDialog } from '../components/audit-detail-dialog'
import { useAuditLogsPage } from '../hooks/use-audit-logs-page'

export function AuditLogsPage() {
  const { action, setAction, list, items, selected, setSelected } = useAuditLogsPage()

  return (
    <>
      <PageHeader title="Nhật ký thao tác" description="Mọi thay đổi của Admin đều được ghi lại. Bấm vào một dòng để xem chi tiết." />
      <ListToolbar>
        <SearchInput value={action} onChange={setAction} placeholder="Mã thao tác, vd. PRODUCT_PUBLISHED" />
      </ListToolbar>
      <ErrorAlert error={list.error} />
      <DataTable
        columns={auditColumns}
        data={items}
        isLoading={list.isPending}
        getRowId={(row) => row.id}
        onRowClick={setSelected}
      />
      {list.hasNextPage ? (
        <div className="flex justify-center">
          <Button variant="outline" disabled={list.isFetchingNextPage} onClick={() => void list.fetchNextPage()}>
            Tải thêm
          </Button>
        </div>
      ) : null}
      {selected ? <AuditDetailDialog entry={selected} onClose={() => setSelected(null)} /> : null}
    </>
  )
}
