import { useQueries } from '@tanstack/react-query'
import type { LinkProps } from '@tanstack/react-router'
import { FileText, FilePen, Image, MessagesSquare, Package, PackageCheck, Truck, type LucideIcon } from 'lucide-react'
import { usePermissions } from '@/features/auth/hooks/use-permission'
import { useMe } from '@/features/auth/hooks/use-me'
import { productListQuery } from '@/features/catalog/products/queries'
import { storyListQuery } from '@/features/cms/stories/queries'
import { pageListQuery } from '@/features/cms/pages/queries'
import { mediaListQuery } from '@/features/media/queries'
import { orderListQuery } from '@/features/orders/queries'
import { PERMISSIONS, type Permission } from '@/lib/permissions'

interface StatDefinition {
  label: string
  to: NonNullable<LinkProps['to']>
  permission: Permission
  icon: LucideIcon
  // Every list endpoint returns { total }; limit=1 keeps the request cheap.
  query: { queryKey: readonly unknown[]; queryFn?: unknown }
}

const STATS: StatDefinition[] = [
  { label: 'Tổng sản phẩm', icon: Package, to: '/catalog/products', permission: PERMISSIONS.catalogRead, query: productListQuery({ page: 1, limit: 1 }) },
  { label: 'Đang bán', icon: PackageCheck, to: '/catalog/products', permission: PERMISSIONS.catalogRead, query: productListQuery({ page: 1, limit: 1, status: 'PUBLISHED' }) },
  { label: 'Sản phẩm nháp', icon: FilePen, to: '/catalog/products', permission: PERMISSIONS.catalogRead, query: productListQuery({ page: 1, limit: 1, status: 'DRAFT' }) },
  { label: 'Đơn đã thanh toán, chờ giao', icon: Truck, to: '/orders', permission: PERMISSIONS.ordersRead, query: orderListQuery({ page: 1, limit: 1, status: 'PAID', fulfillmentStatus: 'UNFULFILLED' }) },
  { label: 'Ảnh sẵn sàng', icon: Image, to: '/media', permission: PERMISSIONS.mediaRead, query: mediaListQuery({ page: 1, limit: 1, status: 'READY' }) },
  { label: 'Trang nội dung', icon: FileText, to: '/cms/pages', permission: PERMISSIONS.pageRead, query: pageListQuery({ page: 1, limit: 1, status: 'ACTIVE' }) },
  { label: 'Bài viết', icon: MessagesSquare, to: '/cms/stories', permission: PERMISSIONS.storyRead, query: storyListQuery({ page: 1, limit: 1 }) },
]

export function useDashboardPage() {
  const { admin } = useMe()
  const { can } = usePermissions()
  const visible = STATS.filter((stat) => can(stat.permission))
  const results = useQueries({
    queries: visible.map((stat) => stat.query as ReturnType<typeof productListQuery>),
  })

  return {
    admin,
    stats: visible.map((stat, index) => ({
      label: stat.label,
      to: stat.to,
      icon: stat.icon,
      value: results[index]?.data?.total,
      isLoading: results[index]?.isPending ?? true,
      error: results[index]?.error,
    })),
  }
}
