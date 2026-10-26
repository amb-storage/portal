import { keepPreviousData, queryOptions } from '@tanstack/react-query'
import { mediaService } from './media.service'
import type { MediaListQuery } from './types'

export const mediaKeys = {
  all: ['media'] as const,
  list: (query: MediaListQuery) => [...mediaKeys.all, 'list', query] as const,
  folders: () => [...mediaKeys.all, 'folders'] as const,
  everything: (filters: Omit<MediaListQuery, 'page' | 'limit'>) => [...mediaKeys.all, 'everything', filters] as const,
}

export const mediaListQuery = (query: MediaListQuery) =>
  queryOptions({
    queryKey: mediaKeys.list(query),
    queryFn: () => mediaService.list(query),
    placeholderData: keepPreviousData,
  })

export const mediaFoldersQuery = () =>
  queryOptions({
    queryKey: mediaKeys.folders(),
    queryFn: async () => (await mediaService.folders()).folders,
  })

export const mediaEverythingQuery = (filters: Omit<MediaListQuery, 'page' | 'limit'>) =>
  queryOptions({
    queryKey: mediaKeys.everything(filters),
    queryFn: () => mediaService.listAll(filters),
    placeholderData: keepPreviousData,
  })
