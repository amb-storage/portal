import { keepPreviousData, queryOptions } from '@tanstack/react-query'
import { mediaService } from './media.service'
import type { MediaListQuery } from './types'

export const mediaKeys = {
  all: ['media'] as const,
  list: (query: MediaListQuery) => [...mediaKeys.all, 'list', query] as const,
}

export const mediaListQuery = (query: MediaListQuery) =>
  queryOptions({
    queryKey: mediaKeys.list(query),
    queryFn: () => mediaService.list(query),
    placeholderData: keepPreviousData,
  })
