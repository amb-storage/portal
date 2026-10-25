import { Link } from '@tanstack/react-router'
import { StatusBadge } from '@/components/common/status-badge'
import { columnHelper } from '@/components/data-table/columns'
import { formatDateTime, formatMoney } from '@/lib/format'
import type { OrderSummary } from '../types'

const helper = columnHelper<OrderSummary>()

export const orderColumns = helper.columns([
  helper.accessor('order_number', {
    header: 'Đơn hàng',
    cell: ({ row }) => (
      <Link to="/orders/$orderId" params={{ orderId: row.original.id }} className="grid gap-0.5 hover:underline">
        <span className="font-medium">{row.original.order_number}</span>
        <span className="text-xs text-muted-foreground">{row.original.email}</span>
      </Link>
    ),
  }),
  helper.accessor('total_amount', {
    header: 'Tổng tiền',
    cell: ({ row }) => formatMoney(row.original.total_amount, row.original.currency),
  }),
  helper.accessor('status', { header: 'Thanh toán', cell: (info) => <StatusBadge status={info.getValue()} /> }),
  helper.accessor('fulfillment_status', { header: 'Giao hàng', cell: (info) => <StatusBadge status={info.getValue()} /> }),
  helper.accessor('paid_at', { header: 'Thanh toán lúc', cell: (info) => formatDateTime(info.getValue()) }),
  helper.accessor('created_at', { header: 'Ngày tạo', cell: (info) => formatDateTime(info.getValue()) }),
])
