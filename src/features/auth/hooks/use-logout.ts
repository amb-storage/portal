import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { describeError } from '@/lib/api/errors'
import { authService } from '../auth.service'
import { authKeys } from '../queries'

export function useLogout(scope: 'current' | 'all' = 'current') {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  return useMutation({
    mutationFn: scope === 'all' ? authService.logoutAll : authService.logout,
    onSuccess: async () => {
      queryClient.setQueryData(authKeys.me, null)
      queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== 'auth' })
      await navigate({ to: '/login' })
    },
    onError: (error) => toast.error(describeError(error)),
  })
}
