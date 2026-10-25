import { queryOptions } from '@tanstack/react-query'
import { navigationService } from './navigation.service'
import type { MenuKey } from './types'

export const navigationKeys = {
  all: ['navigation'] as const,
  menu: (key: MenuKey) => [...navigationKeys.all, key] as const,
}

export const menuQuery = (key: MenuKey) =>
  queryOptions({ queryKey: navigationKeys.menu(key), queryFn: () => navigationService.get(key) })
