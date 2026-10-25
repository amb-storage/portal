import { getRouteApi } from '@tanstack/react-router'
import { useCan } from '@/features/auth/hooks/use-permission'
import { PERMISSIONS } from '@/lib/permissions'
import type { MenuKey } from '../types'

const route = getRouteApi('/_app/navigation')

export function useNavigationPage() {
  const { menu } = route.useSearch()
  const navigate = route.useNavigate()
  const canManage = useCan(PERMISSIONS.navigationManage)
  return {
    menuKey: menu,
    setMenuKey: (next: string) => navigate({ search: { menu: next as MenuKey }, replace: true }),
    canManage,
  }
}
