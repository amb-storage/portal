import { Link } from '@tanstack/react-router'
import { StatusBadge } from '@/components/common/status-badge'
import { columnHelper } from '@/components/data-table/columns'
import { formatDateTime, formatMoney } from '@/lib/format'
import type { ProductSummary } from '../types'

const helper = columnHelper<ProductSummary>()

export const productColumns = helper.columns([
  helper.accessor('name_en', {
    header: 'Sản phẩm',
    cell: ({ row }) => (
      <Link
        to="/catalog/products/$productId"
        params={{ productId: row.original.id }}
        className="grid gap-0.5 hover:underline"
      >
        <span className="font-medium">{row.original.name_en || 'Chưa đặt tên'}</span>
        <span className="text-xs text-muted-foreground">{row.original.name_ja}</span>
      </Link>
    ),
  }),
  helper.accessor('slug', { header: 'Slug', cell: (info) => <code className="text-xs">{info.getValue() ?? '—'}</code> }),
  helper.accessor('price', {
    header: 'Giá',
    cell: (info) => {
      const price = info.getValue()
      return price === null ? '—' : formatMoney(price, 'JPY')
    },
  }),
  helper.accessor('size', { header: 'Size', cell: (info) => info.getValue() ?? '—' }),
  helper.accessor('quantity', { header: 'Tồn kho', cell: (info) => <span className="tabular-nums">{info.getValue() ?? '—'}</span> }),
  helper.accessor('status', { header: 'Trạng thái', cell: (info) => <StatusBadge status={info.getValue()} /> }),
  helper.accessor('updated_at', { header: 'Cập nhật', cell: (info) => formatDateTime(info.getValue()) }),
])
