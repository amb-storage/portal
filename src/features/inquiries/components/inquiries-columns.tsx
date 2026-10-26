import { Link } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/common/status-badge'
import { columnHelper } from '@/components/data-table/columns'
import { formatDateTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import { INQUIRY_CATEGORY_LABELS, type Inquiry } from '../types'

const helper = columnHelper<Inquiry>()

export const inquiryColumns = helper.columns([
  helper.accessor('name', {
    header: 'Người gửi',
    cell: ({ row }) => (
      <span className={cn('grid gap-0.5', row.original.status === 'NEW' && 'font-semibold')}>
        <span>{row.original.name}</span>
        <span className="text-xs font-normal text-muted-foreground">{row.original.email}</span>
      </span>
    ),
  }),
  helper.accessor('subject', {
    header: 'Nội dung',
    cell: ({ row }) => (
      <Link to="/inquiries/$inquiryId" params={{ inquiryId: row.original.id }} className="grid max-w-md gap-0.5 hover:underline">
        <span className={cn('truncate', row.original.status === 'NEW' && 'font-semibold')}>{row.original.subject}</span>
        <span className="truncate text-xs text-muted-foreground">{row.original.message.replaceAll('\n', ' ')}</span>
      </Link>
    ),
  }),
  helper.accessor('category', {
    header: 'Chủ đề',
    cell: (info) => <Badge variant="outline">{INQUIRY_CATEGORY_LABELS[info.getValue()]}</Badge>,
  }),
  helper.accessor('locale', { header: 'Ngôn ngữ', cell: (info) => (info.getValue() === 'ja' ? 'Nhật' : 'Anh') }),
  helper.accessor('status', { header: 'Trạng thái', cell: (info) => <StatusBadge status={info.getValue()} /> }),
  helper.accessor('createdAt', { header: 'Nhận lúc', cell: (info) => formatDateTime(info.getValue()) }),
])
