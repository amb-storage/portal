import type { LinkProps } from '@tanstack/react-router'
import type { LucideIcon } from 'lucide-react'
import {
  FileText,
  Globe,
  Info,
  ScrollText,
  FolderTree,
  HelpCircle,
  History,
  Image,
  Inbox,
  LayoutDashboard,
  Menu,
  MessageSquareQuote,
  MessagesSquare,
  Newspaper,
  Package,
  Receipt,
  Settings,
  ShoppingBag,
} from 'lucide-react'
import { PERMISSIONS, type Permission } from '@/lib/permissions'

export interface NavItem {
  title: string
  to: NonNullable<LinkProps['to']>
  icon: LucideIcon
  permission?: Permission
}

/** A top-level link, or a collapsible section of links. */
export type NavEntry = ({ kind: 'link' } & NavItem) | { kind: 'section'; id: string; title: string; icon: LucideIcon; items: NavItem[] }

/**
 * Sidebar, grouped by job: daily work first (sales, website content, blog), the media library on
 * its own because every editor uses it, rarely used setup last, and the guide pinned at the bottom.
 */
export const NAV_ENTRIES: NavEntry[] = [
  { kind: 'link', title: 'Bảng điều khiển', to: '/', icon: LayoutDashboard },
  {
    kind: 'section',
    id: 'sales',
    title: 'Bán hàng',
    icon: ShoppingBag,
    items: [
      { title: 'Sản phẩm', to: '/catalog/products', icon: Package, permission: PERMISSIONS.catalogRead },
      { title: 'Danh mục', to: '/catalog/categories', icon: FolderTree, permission: PERMISSIONS.catalogRead },
      { title: 'Đơn hàng', to: '/orders', icon: Receipt, permission: PERMISSIONS.ordersRead },
      // TODO: gate with an inquiries permission once the API defines one (mock-up for now).
      { title: 'Liên hệ', to: '/inquiries', icon: Inbox },
    ],
  },
  {
    kind: 'section',
    id: 'website',
    title: 'Trang website',
    icon: Globe,
    items: [
      { title: 'Customer Voice', to: '/cms/customer-voice', icon: MessageSquareQuote, permission: PERMISSIONS.pageRead },
      { title: 'Giới thiệu', to: '/cms/about', icon: Info, permission: PERMISSIONS.pageRead },
      { title: 'Chính sách', to: '/cms/policies', icon: ScrollText, permission: PERMISSIONS.pageRead },
      { title: 'Trang khác', to: '/cms/pages', icon: FileText, permission: PERMISSIONS.pageRead },
    ],
  },
  {
    // The blog ("Mili Talks" on the website) is its own section, apart from the fixed pages.
    kind: 'section',
    id: 'blog',
    title: 'Mili Talks (Blog)',
    icon: Newspaper,
    items: [
      { title: 'Bài viết', to: '/cms/stories', icon: MessagesSquare, permission: PERMISSIONS.storyRead },
      { title: 'Trang chủ blog', to: '/cms/mili-talks', icon: Newspaper, permission: PERMISSIONS.pageRead },
    ],
  },
  { kind: 'link', title: 'Thư viện ảnh', to: '/media', icon: Image, permission: PERMISSIONS.mediaRead },
  {
    kind: 'section',
    id: 'setup',
    title: 'Thiết lập',
    icon: Settings,
    items: [
      { title: 'Menu điều hướng', to: '/navigation', icon: Menu, permission: PERMISSIONS.navigationRead },
      { title: 'Cài đặt cửa hàng', to: '/settings', icon: Settings, permission: PERMISSIONS.settingsRead },
      { title: 'Nhật ký thao tác', to: '/audit-logs', icon: History, permission: PERMISSIONS.auditRead },
    ],
  },
]

/** Pinned under the main menu. */
export const NAV_FOOTER_LINK: NavItem = { title: 'Hướng dẫn', to: '/guide', icon: HelpCircle }
