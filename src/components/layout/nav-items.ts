import type { LinkProps } from '@tanstack/react-router'
import type { LucideIcon } from 'lucide-react'
import {
  FileText,
  FolderTree,
  HelpCircle,
  History,
  Image,
  LayoutDashboard,
  Menu,
  MessagesSquare,
  Package,
  Receipt,
  Settings,
} from 'lucide-react'
import { PERMISSIONS, type Permission } from '@/lib/permissions'

export interface NavItem {
  title: string
  to: NonNullable<LinkProps['to']>
  icon: LucideIcon
  permission?: Permission
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Tổng quan',
    items: [
      { title: 'Bảng điều khiển', to: '/', icon: LayoutDashboard },
      { title: 'Hướng dẫn', to: '/guide', icon: HelpCircle },
    ],
  },
  {
    label: 'Sản phẩm',
    items: [
      { title: 'Sản phẩm', to: '/catalog/products', icon: Package, permission: PERMISSIONS.catalogRead },
      { title: 'Danh mục', to: '/catalog/categories', icon: FolderTree, permission: PERMISSIONS.catalogRead },
    ],
  },
  {
    label: 'Vận hành',
    items: [
      { title: 'Đơn hàng', to: '/orders', icon: Receipt, permission: PERMISSIONS.ordersRead },
      { title: 'Thư viện ảnh', to: '/media', icon: Image, permission: PERMISSIONS.mediaRead },
      { title: 'Nhật ký thao tác', to: '/audit-logs', icon: History, permission: PERMISSIONS.auditRead },
    ],
  },
  {
    label: 'Nội dung',
    items: [
      { title: 'Trang', to: '/cms/pages', icon: FileText, permission: PERMISSIONS.pageRead },
      { title: 'Bài viết', to: '/cms/stories', icon: MessagesSquare, permission: PERMISSIONS.storyRead },
      { title: 'Menu điều hướng', to: '/navigation', icon: Menu, permission: PERMISSIONS.navigationRead },
      { title: 'Cài đặt cửa hàng', to: '/settings', icon: Settings, permission: PERMISSIONS.settingsRead },
    ],
  },
]
