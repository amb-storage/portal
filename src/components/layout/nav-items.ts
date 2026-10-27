import type { LinkProps } from '@tanstack/react-router'
import type { LucideIcon } from 'lucide-react'
import {
  FileText,
  Info,
  ScrollText,
  FolderTree,
  HelpCircle,
  History,
  Image,
  Inbox,
  LayoutDashboard,
  Menu,
  MessagesSquare,
  Newspaper,
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
    label: 'Bán hàng',
    items: [
      { title: 'Sản phẩm', to: '/catalog/products', icon: Package, permission: PERMISSIONS.catalogRead },
      { title: 'Danh mục', to: '/catalog/categories', icon: FolderTree, permission: PERMISSIONS.catalogRead },
      { title: 'Đơn hàng', to: '/orders', icon: Receipt, permission: PERMISSIONS.ordersRead },
      // TODO: gate with an inquiries permission once the API defines one (mock-up for now).
      { title: 'Liên hệ', to: '/inquiries', icon: Inbox },
    ],
  },
  {
    // The blog ("Mili Talks" on the website) is its own section, apart from the fixed pages.
    label: 'Mili Talks (Blog)',
    items: [
      { title: 'Bài viết', to: '/cms/stories', icon: MessagesSquare, permission: PERMISSIONS.blogRead },
      { title: 'Trang chủ blog', to: '/cms/mili-talks', icon: Newspaper, permission: PERMISSIONS.pageRead },
    ],
  },
  {
    label: 'Trang website',
    items: [
      { title: 'Giới thiệu', to: '/cms/about', icon: Info, permission: PERMISSIONS.pageRead },
      { title: 'Chính sách', to: '/cms/policies', icon: ScrollText, permission: PERMISSIONS.pageRead },
      { title: 'Trang khác', to: '/cms/pages', icon: FileText, permission: PERMISSIONS.pageRead },
    ],
  },
  {
    label: 'Thiết lập',
    items: [
      { title: 'Thư viện ảnh', to: '/media', icon: Image, permission: PERMISSIONS.mediaRead },
      { title: 'Menu điều hướng', to: '/navigation', icon: Menu, permission: PERMISSIONS.navigationRead },
      { title: 'Cài đặt cửa hàng', to: '/settings', icon: Settings, permission: PERMISSIONS.settingsRead },
      { title: 'Nhật ký thao tác', to: '/audit-logs', icon: History, permission: PERMISSIONS.auditRead },
    ],
  },
]
