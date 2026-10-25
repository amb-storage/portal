import { keepPreviousData, queryOptions } from '@tanstack/react-query'
import { cmsPageService, type PageListQuery } from './cms-page.service'

export const cmsPageKeys = {
  all: ['cms', 'pages'] as const,
  list: (query: PageListQuery) => [...cmsPageKeys.all, 'list', query] as const,
  detail: (id: string) => [...cmsPageKeys.all, 'detail', id] as const,
  draft: (id: string) => [...cmsPageKeys.detail(id), 'draft'] as const,
  fixed: (id: string) => [...cmsPageKeys.detail(id), 'fixed'] as const,
  versions: (id: string, page: number) => [...cmsPageKeys.detail(id), 'versions', page] as const,
  version: (id: string, versionId: string) => [...cmsPageKeys.detail(id), 'version', versionId] as const,
  registry: ['cms', 'section-registry'] as const,
}

export const pageListQuery = (query: PageListQuery) =>
  queryOptions({ queryKey: cmsPageKeys.list(query), queryFn: () => cmsPageService.list(query), placeholderData: keepPreviousData })

export const pageDetailQuery = (id: string) =>
  queryOptions({ queryKey: cmsPageKeys.detail(id), queryFn: () => cmsPageService.get(id) })

export const pageDraftQuery = (id: string) =>
  queryOptions({ queryKey: cmsPageKeys.draft(id), queryFn: () => cmsPageService.getDraft(id) })

export const fixedContentQuery = (id: string) =>
  queryOptions({ queryKey: cmsPageKeys.fixed(id), queryFn: () => cmsPageService.getFixed(id) })

export const pageVersionsQuery = (id: string, page: number, limit: number) =>
  queryOptions({
    queryKey: cmsPageKeys.versions(id, page),
    queryFn: () => cmsPageService.listVersions(id, page, limit),
    placeholderData: keepPreviousData,
  })

export const pageVersionQuery = (id: string, versionId: string) =>
  queryOptions({ queryKey: cmsPageKeys.version(id, versionId), queryFn: () => cmsPageService.getVersion(id, versionId) })

export const sectionRegistryQuery = queryOptions({
  queryKey: cmsPageKeys.registry,
  queryFn: cmsPageService.sectionRegistry,
  staleTime: Infinity,
})
