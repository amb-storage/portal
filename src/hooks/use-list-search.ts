import { useCallback } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'

/**
 * Reads/writes list filters stored in the current route's search params.
 * The route's `validateSearch` schema guarantees the shape of `T`.
 * Changing any filter other than `page` resets to page 1.
 */
export function useListSearch<T extends { page: number }>() {
  const raw: unknown = useSearch({ strict: false })
  const search = raw as T
  const navigate = useNavigate()

  const setSearch = useCallback(
    (patch: Partial<T>) => {
      const next = 'page' in patch ? patch : { ...patch, page: 1 }
      void navigate({ to: '.', search: (prev: object) => ({ ...prev, ...next }), replace: true } as never)
    },
    [navigate],
  )

  return { search, setSearch }
}
