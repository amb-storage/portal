import type { ISODate } from '@/lib/api/types'

export const MENU_KEYS = ['HEADER', 'FOOTER'] as const
export type MenuKey = (typeof MENU_KEYS)[number]

export const DESTINATION_TYPES = ['PAGE', 'CATEGORY', 'PRODUCT', 'MILI_TALK', 'PATH', 'EXTERNAL_URL'] as const
export type DestinationType = (typeof DESTINATION_TYPES)[number]

export interface NavigationItem {
  id: string
  parentId: string | null
  labelJa: string
  labelEn: string
  destinationType: DestinationType
  pageId: string | null
  destination: string | null
  enabled: boolean
  position: number
}

export interface NavigationMenu {
  id: string
  key: MenuKey
  revision: number
  items: NavigationItem[]
  createdAt: ISODate
  updatedAt: ISODate
}

/** Form rows use '' instead of null so inputs stay controlled. */
export interface MenuItemValues {
  id: string
  parentId: string
  labelJa: string
  labelEn: string
  destinationType: DestinationType
  pageId: string
  destination: string
  enabled: boolean
}

export interface MenuFormValues {
  items: MenuItemValues[]
}
