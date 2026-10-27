import { Link } from '@tanstack/react-router'
import { Trash2 } from 'lucide-react'
import { ConfirmButton } from '@/components/common/confirm-button'
import { StatusBadge } from '@/components/common/status-badge'
import { columnHelper } from '@/components/data-table/columns'
import { formatDateTime } from '@/lib/format'
import type { BlogPostSummary } from '../blog.types'

const helper = columnHelper<BlogPostSummary>()

interface ColumnActions {
  canManage: boolean
  onDelete: (id: string) => void
}

export function buildStoryColumns(actions: ColumnActions) {
  return helper.columns([
    helper.display({
      id: 'title',
      header: 'Bài viết',
      cell: ({ row }) => {
        const title = row.original.published?.titleEn ?? row.original.draft?.titleEn ?? row.original.draft?.titleJa
        return (
          <Link to="/cms/stories/$postId" params={{ postId: row.original.id }} className="grid gap-0.5 hover:underline">
            <span className="font-medium">{title || 'Chưa có tiêu đề'}</span>
            <code className="text-xs text-muted-foreground">{row.original.slug}</code>
          </Link>
        )
      },
    }),
    helper.accessor('publicationStatus', { header: 'Xuất bản', cell: (info) => <StatusBadge status={info.getValue()} /> }),
    helper.accessor('pageStatus', { header: 'Trang', cell: (info) => <StatusBadge status={info.getValue()} /> }),
    helper.display({
      id: 'publishedAt',
      header: 'Ngày xuất bản',
      cell: ({ row }) => formatDateTime(row.original.published?.publishedAt),
    }),
    helper.accessor('updatedAt', { header: 'Cập nhật', cell: (info) => formatDateTime(info.getValue()) }),
    helper.display({
      id: 'actions',
      cell: ({ row }) =>
        actions.canManage && row.original.pageStatus === 'ACTIVE' ? (
          <div className="flex justify-end">
            <ConfirmButton
              size="icon"
              variant="ghost"
              aria-label="Xoá"
              title="Xoá bài viết?"
              description="Bài viết sẽ bị gỡ khỏi website và lưu trữ."
              confirmLabel="Xoá"
              onConfirm={() => actions.onDelete(row.original.id)}
            >
              <Trash2 />
            </ConfirmButton>
          </div>
        ) : null,
    }),
  ])
}
