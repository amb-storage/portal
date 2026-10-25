import { useQuery } from '@tanstack/react-query'
import { useCan } from '@/features/auth/hooks/use-permission'
import { PERMISSIONS } from '@/lib/permissions'
import { settingsQuery } from '../queries'

export function useSettingsPage() {
  const settings = useQuery(settingsQuery)
  const canManage = useCan(PERMISSIONS.settingsManage)
  return { settings, canManage }
}
