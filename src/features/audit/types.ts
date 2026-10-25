import type { ISODate } from '@/lib/api/types'

export interface AuditLog {
  id: string
  actorAdminUserId: string | null
  action: string
  targetType: string | null
  targetId: string | null
  outcome: string
  requestId: string | null
  ip: string | null
  userAgent: string | null
  metadata: Record<string, unknown>
  createdAt: ISODate
}

/** Keyset pagination: pass nextCursor back as `cursor` until it is null. */
export interface AuditPage {
  items: AuditLog[]
  nextCursor: string | null
}

export interface AuditListQuery {
  limit?: number
  cursor?: string
  action?: string
}
