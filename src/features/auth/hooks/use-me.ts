import { useSuspenseQuery } from '@tanstack/react-query'
import { meQueryOptions } from '../queries'
import type { MeResponse } from '../types'

/** Current Admin; only call below the authenticated layout. */
export function useMe(): MeResponse {
  const { data } = useSuspenseQuery(meQueryOptions)
  if (!data) throw new Error('useMe called outside an authenticated route')
  return data
}
