import { Link } from '@tanstack/react-router'
import { Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ConfirmButton } from '@/components/common/confirm-button'
import { StatusBadge } from '@/components/common/status-badge'
import { columnHelper } from '@/components/data-table/columns'
import { formatDateTime } from '@/lib/format'
import { statusLabel } from '@/lib/labels'
import type { PageListRow } from '../types'

const helper = columnHelper<PageListRow>()

interface PageColumnOptions {
  canDelete: boolean
  onDelete: (id: string) => void
  /** Hide the type column on lists that show a single type (e.g. policies). */
  showType?: boolean
}

export function buildPageColumns({ canDelete, onDelete, showType = true }: PageColumnOptions) {
  return helper.columns([
    helper.accessor('slug', {
      header: 'Slug',
      cell: ({ row }) => (
        <Link to="/cms/pages/$pageId" params={{ pageId: row.original.id }} className="font-medium hover:underline">
          {row.original.slug}
        </Link>
      ),
    }),
    ...(showType ? [helper.accessor('type', { header: 'Loại', cell: (info) => <Badge variant="outline">{statusLabel(info.getValue())}</Badge> })] : []),
    helper.display({
      id: 'published',
      header: 'Trên website',
      cell: ({ row }) =>
        row.original.status !== 'ACTIVE' ? (
          <StatusBadge status={row.original.status} />
        ) : row.original.published_id ? (
          <span className="grid gap-0.5">
            <StatusBadge status="PUBLISHED" />
            <span className="text-xs text-muted-foreground">{formatDateTime(row.original.published_at)}</span>
          </span>
        ) : (
          <StatusBadge status="DRAFT" />
        ),
    }),
    helper.accessor('updated_at', { header: 'Cập nhật', cell: (info) => formatDateTime(info.getValue()) }),
    helper.display({
      id: 'actions',
      cell: ({ row }) =>
        canDelete && row.original.status === 'ACTIVE' ? (
          <div className="flex justify-end">
            <ConfirmButton
              size="icon"
              variant="ghost"
              aria-label="Xoá trang"
              title={`Xoá trang "${row.original.slug}"?`}
              description="Trang sẽ bị gỡ khỏi website và không khôi phục được. Nhớ gỡ các mục menu đang trỏ tới trang này."
              confirmLabel="Xoá"
              onConfirm={() => onDelete(row.original.id)}
            >
              <Trash2 />
            </ConfirmButton>
          </div>
        ) : null,
    }),
  ])
}
