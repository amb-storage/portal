import { useQuery } from '@tanstack/react-query'
import type { Permission } from '@/lib/permissions'
import { meQueryOptions } from '../queries'

export function usePermissions() {
  const { data } = useQuery(meQueryOptions)
  const granted = new Set(data?.admin.permissions ?? [])
  // PermissionsGuard treats '*' as every permission.
  const can = (permission: Permission) => granted.has('*') || granted.has(permission)
  return {
    can,
    canAny: (permissions: readonly Permission[]) => permissions.some(can),
  }
}

export function useCan(permission: Permission) {
  return usePermissions().can(permission)
}
