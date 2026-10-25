import { api } from '@/lib/api/client'
import type { AuditListQuery, AuditPage } from './types'

/** /api/v1/admin/audit-logs (newest first, cursor-paginated). */
export const auditService = {
  list: (query: AuditListQuery) => api.get<AuditPage>('/audit-logs', { ...query }),
}
