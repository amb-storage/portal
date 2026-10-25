import { infiniteQueryOptions } from '@tanstack/react-query'
import { auditService } from './audit.service'

const PAGE_SIZE = 50

export const auditKeys = {
  all: ['audit-logs'] as const,
  list: (action?: string) => [...auditKeys.all, 'list', action ?? null] as const,
}

export const auditListQuery = (action?: string) =>
  infiniteQueryOptions({
    queryKey: auditKeys.list(action),
    queryFn: ({ pageParam }) => auditService.list({ limit: PAGE_SIZE, action, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  })
