import { z } from 'zod'
import { optionalText } from '@/lib/search'

export const auditSearchSchema = z.object({ action: optionalText })

export type AuditSearch = z.infer<typeof auditSearchSchema>
