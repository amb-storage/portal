import { api } from '@/lib/api/client'
import type { MenuKey, NavigationItem, NavigationMenu } from './types'

/** /api/v1/admin/navigation/menus/:key (HEADER | FOOTER). */
export const navigationService = {
  list: () => api.get<{ items: NavigationMenu[] }>('/navigation/menus'),
  get: (key: MenuKey) => api.get<NavigationMenu>(`/navigation/menus/${key}`),
  replace: (key: MenuKey, body: { expectedRevision: number; items: NavigationItem[] }) =>
    api.put<NavigationMenu>(`/navigation/menus/${key}`, body),
}
