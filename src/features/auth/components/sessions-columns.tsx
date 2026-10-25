import { Badge } from '@/components/ui/badge'
import { ConfirmButton } from '@/components/common/confirm-button'
import { columnHelper } from '@/components/data-table/columns'
import { formatDateTime } from '@/lib/format'
import type { SessionItem } from '../types'

const helper = columnHelper<SessionItem>()

export function buildSessionColumns(onRevoke: (id: string) => void) {
  return helper.columns([
    helper.accessor('userAgent', {
      header: 'Thiết bị',
      cell: ({ row }) => (
        <div className="grid max-w-md gap-0.5">
          <span className="truncate">{row.original.userAgent ?? 'Không rõ thiết bị'}</span>
          <span className="text-xs text-muted-foreground">{row.original.ip ?? '—'}</span>
        </div>
      ),
    }),
    helper.accessor('createdAt', { header: 'Đăng nhập lúc', cell: (info) => formatDateTime(info.getValue()) }),
    helper.accessor('lastSeenAt', { header: 'Hoạt động gần nhất', cell: (info) => formatDateTime(info.getValue()) }),
    helper.accessor('expiresAt', { header: 'Hết hạn', cell: (info) => formatDateTime(info.getValue()) }),
    helper.display({
      id: 'actions',
      cell: ({ row }) =>
        row.original.current ? (
          <Badge>Phiên này</Badge>
        ) : (
          <ConfirmButton
            size="sm"
            variant="outline"
            title="Đăng xuất phiên này?"
            description="Thiết bị sẽ bị đăng xuất ngay lập tức."
            onConfirm={() => onRevoke(row.original.id)}
          >
            Đăng xuất
          </ConfirmButton>
        ),
    }),
  ])
}
