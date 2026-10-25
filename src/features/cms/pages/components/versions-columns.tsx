import { Eye, History } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfirmButton } from '@/components/common/confirm-button'
import { StatusBadge } from '@/components/common/status-badge'
import { columnHelper } from '@/components/data-table/columns'
import { formatDateTime } from '@/lib/format'
import type { VersionSummaryRow } from '../types'

const helper = columnHelper<VersionSummaryRow>()

interface VersionActions {
  canPublish: boolean
  onView: (id: string) => void
  onRollback: (id: string) => void
}

export function buildVersionColumns(actions: VersionActions) {
  return helper.columns([
    helper.accessor('version', { header: 'Phiên bản', cell: (info) => `v${info.getValue()}` }),
    helper.accessor('status', { header: 'Trạng thái', cell: (info) => <StatusBadge status={info.getValue()} /> }),
    helper.accessor('revision', { header: 'Lần sửa' }),
    helper.accessor('published_at', { header: 'Xuất bản', cell: (info) => formatDateTime(info.getValue()) }),
    helper.accessor('effective_at', { header: 'Hiệu lực', cell: (info) => formatDateTime(info.getValue()) }),
    helper.accessor('updated_at', { header: 'Cập nhật', cell: (info) => formatDateTime(info.getValue()) }),
    helper.display({
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <Button size="icon" variant="ghost" aria-label="Xem" onClick={() => actions.onView(row.original.id)}>
            <Eye />
          </Button>
          {actions.canPublish && row.original.status !== 'DRAFT' ? (
            <ConfirmButton
              size="icon"
              variant="ghost"
              aria-label="Khôi phục"
              title={`Khôi phục về v${row.original.version}?`}
              description="Xuất bản lại nội dung phiên bản này và thay thế bản nháp hiện tại."
              confirmLabel="Khôi phục"
              onConfirm={() => actions.onRollback(row.original.id)}
            >
              <History />
            </ConfirmButton>
          ) : null}
        </div>
      ),
    }),
  ])
}
