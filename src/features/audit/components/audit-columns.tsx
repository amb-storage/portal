import { StatusBadge } from '@/components/common/status-badge'
import { columnHelper } from '@/components/data-table/columns'
import { formatDateTime, shortId } from '@/lib/format'
import type { AuditLog } from '../types'

const helper = columnHelper<AuditLog>()

export const auditColumns = helper.columns([
  helper.accessor('createdAt', { header: 'Thời gian', cell: (info) => formatDateTime(info.getValue()) }),
  helper.accessor('action', { header: 'Thao tác', cell: (info) => <code className="text-xs">{info.getValue()}</code> }),
  helper.accessor('outcome', { header: 'Kết quả', cell: (info) => <StatusBadge status={info.getValue()} /> }),
  helper.display({
    id: 'target',
    header: 'Đối tượng',
    cell: ({ row }) =>
      row.original.targetType ? (
        <span className="text-xs">
          {row.original.targetType} {row.original.targetId ? <code>{shortId(row.original.targetId)}</code> : null}
        </span>
      ) : (
        '—'
      ),
  }),
  helper.accessor('actorAdminUserId', {
    header: 'Người thực hiện',
    cell: (info) => {
      const actor = info.getValue()
      return actor ? <code className="text-xs">{shortId(actor)}</code> : 'hệ thống'
    },
  }),
  helper.accessor('ip', { header: 'IP', cell: (info) => info.getValue() ?? '—' }),
])
