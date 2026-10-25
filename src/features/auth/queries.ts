import { queryOptions } from '@tanstack/react-query'
import { isApiError } from '@/lib/api/errors'
import { authService } from './auth.service'
import type { MeResponse } from './types'

export const authKeys = {
  me: ['auth', 'me'] as const,
  sessions: ['auth', 'sessions'] as const,
  setupStatus: ['auth', 'setup-status'] as const,
}

/** Resolves to null when there is no valid Admin session. */
export const meQueryOptions = queryOptions({
  queryKey: authKeys.me,
  queryFn: async (): Promise<MeResponse | null> => {
    try {
      return await authService.me()
    } catch (error) {
      if (isApiError(error) && error.status === 401) return null
      throw error
    }
  },
  staleTime: 60_000,
})

export const sessionsQueryOptions = queryOptions({
  queryKey: authKeys.sessions,
  queryFn: authService.sessions,
})

export const setupStatusQueryOptions = queryOptions({
  queryKey: authKeys.setupStatus,
  queryFn: authService.setupStatus,
  staleTime: 0,
})
