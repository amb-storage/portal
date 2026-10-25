import { Link } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/common/status-badge'
import { columnHelper } from '@/components/data-table/columns'
import { formatDateTime } from '@/lib/format'
import type { PageListRow } from '../types'

const helper = columnHelper<PageListRow>()

export const pageColumns = helper.columns([
  helper.accessor('slug', {
    header: 'Slug',
    cell: ({ row }) => (
      <Link to="/cms/pages/$pageId" params={{ pageId: row.original.id }} className="font-medium hover:underline">
        {row.original.slug}
      </Link>
    ),
  }),
  helper.accessor('type', { header: 'Loại', cell: (info) => <Badge variant="outline">{info.getValue()}</Badge> }),
  helper.accessor('status', { header: 'Trạng thái', cell: (info) => <StatusBadge status={info.getValue()} /> }),
  helper.display({
    id: 'published',
    header: 'Xuất bản',
    cell: ({ row }) =>
      row.original.published_id ? `v${row.original.published_version} · ${formatDateTime(row.original.published_at)}` : '—',
  }),
  helper.display({
    id: 'draft',
    header: 'Nháp',
    cell: ({ row }) => (row.original.draft_id ? `v${row.original.draft_version} r${row.original.draft_revision}` : '—'),
  }),
  helper.accessor('updated_at', { header: 'Cập nhật', cell: (info) => formatDateTime(info.getValue()) }),
])
