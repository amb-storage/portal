import { keepPreviousData, queryOptions } from '@tanstack/react-query'
import { blogService } from './blog.service'
import type { BlogPostListQuery } from './blog.types'

const blogRootKey = ['blog'] as const

export const blogKeys = {
  all: blogRootKey,
  list: (query: BlogPostListQuery) => [...blogRootKey, 'list', query] as const,
  detail: (id: string) => [...blogRootKey, 'detail', id] as const,
  registry: [...blogRootKey, 'section-registry'] as const,
}

export const blogListQuery = (query: BlogPostListQuery) =>
  queryOptions({ queryKey: blogKeys.list(query), queryFn: () => blogService.list(query), placeholderData: keepPreviousData })

export const blogPostQuery = (id: string) => queryOptions({ queryKey: blogKeys.detail(id), queryFn: () => blogService.get(id) })

export const blogSectionRegistryQuery = queryOptions({
  queryKey: blogKeys.registry,
  queryFn: blogService.sectionRegistry,
  staleTime: Infinity,
})
