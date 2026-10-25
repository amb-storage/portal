import { createFileRoute } from '@tanstack/react-router'
import { AuditLogsPage } from '@/features/audit/pages/audit-logs-page'
import { auditSearchSchema } from '@/features/audit/search'

export const Route = createFileRoute('/_app/audit-logs')({
  staticData: { crumb: { title: 'Nhật ký thao tác' } },
  validateSearch: auditSearchSchema,
  component: AuditLogsPage,
})
