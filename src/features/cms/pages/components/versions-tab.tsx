import { useMemo } from 'react'
import { ErrorAlert } from '@/components/common/query-state'
import { DataTable } from '@/components/data-table/data-table'
import { DataTablePagination } from '@/components/data-table/data-table-pagination'
import { usePageVersionsTab } from '../hooks/use-page-versions-tab'
import { buildVersionColumns } from './versions-columns'
import { VersionViewDialog } from './version-view-dialog'

export function VersionsTab({ pageId, canPublish }: { pageId: string; canPublish: boolean }) {
  const { versions, page, setPage, limit, total, rollback, viewing, setViewing } = usePageVersionsTab(pageId)
  const rollbackVersion = rollback.mutate
  const columns = useMemo(
    () => buildVersionColumns({ canPublish, onView: setViewing, onRollback: (id) => rollbackVersion(id) }),
    [canPublish, setViewing, rollbackVersion],
  )

  return (
    <div className="grid gap-4">
      <ErrorAlert error={versions.error} />
      <DataTable columns={columns} data={versions.data?.items} isLoading={versions.isPending} getRowId={(row) => row.id} />
      <DataTablePagination page={page} limit={limit} total={total} onPageChange={setPage} />
      {viewing ? <VersionViewDialog pageId={pageId} versionId={viewing} onClose={() => setViewing(null)} /> : null}
    </div>
  )
}
