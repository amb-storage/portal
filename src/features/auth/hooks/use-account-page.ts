import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { describeError } from '@/lib/api/errors'
import { authService } from '../auth.service'
import { authKeys, sessionsQueryOptions } from '../queries'
import { useLogout } from './use-logout'
import { useMe } from './use-me'

export function useAccountPage() {
  const me = useMe()
  const queryClient = useQueryClient()
  const sessions = useQuery(sessionsQueryOptions)
  const logoutAll = useLogout('all')

  const revoke = useMutation({
    mutationFn: authService.revokeSession,
    onSuccess: () => {
      toast.success('Đã đăng xuất phiên')
      return queryClient.invalidateQueries({ queryKey: authKeys.sessions })
    },
    onError: (error) => toast.error(describeError(error)),
  })

  return { me, sessions, revoke, logoutAll }
}
