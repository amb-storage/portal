import { api } from '@/lib/api/client'
import type { AnalyticsEnvelope, DateRange, FinancialDashboard } from './types'

/** Read-only dashboard data; both routes require orders.read (ADMIN_API_MAPPING.md). */
export const dashboardService = {
  financial: (range: DateRange) => api.get<FinancialDashboard>('/orders/financial-dashboard', { ...range }),
  analytics: (range: DateRange) => api.get<AnalyticsEnvelope>('/analytics', { ...range }),
}
