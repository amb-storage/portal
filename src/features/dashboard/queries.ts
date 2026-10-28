import { keepPreviousData, queryOptions } from '@tanstack/react-query'
import { dashboardService } from './dashboard.service'
import type { DateRange } from './types'

export const dashboardKeys = {
  financial: (range: DateRange) => ['dashboard', 'financial', range] as const,
  analytics: (range: DateRange) => ['dashboard', 'analytics', range] as const,
}

export const financialQuery = (range: DateRange) =>
  queryOptions({ queryKey: dashboardKeys.financial(range), queryFn: () => dashboardService.financial(range), placeholderData: keepPreviousData })

/** The API caches provider results for 2 minutes; no point refetching sooner. */
export const analyticsQuery = (range: DateRange) =>
  queryOptions({ queryKey: dashboardKeys.analytics(range), queryFn: () => dashboardService.analytics(range), placeholderData: keepPreviousData, staleTime: 120_000 })
