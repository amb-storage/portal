import { useInfiniteQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { useState } from 'react'
import { auditListQuery } from '../queries'
import type { AuditLog } from '../types'

const route = getRouteApi('/_app/audit-logs')

export function useAuditLogsPage() {
  const { action } = route.useSearch()
  const navigate = route.useNavigate()
  const [selected, setSelected] = useState<AuditLog | null>(null)
  const list = useInfiniteQuery(auditListQuery(action))

  return {
    action,
    // Action codes are stored upper-case (e.g. PRODUCT_STOCK_ADJUSTED) and matched exactly.
    setAction: (next?: string) => navigate({ search: { action: next?.toUpperCase() }, replace: true }),
    list,
    items: list.data?.pages.flatMap((page) => page.items),
    selected,
    setSelected,
  }
}
