import { keepPreviousData, queryOptions } from '@tanstack/react-query'
import { categoryService } from './category.service'
import type { CategoryListQuery } from './types'

export const categoryKeys = {
  all: ['catalog', 'categories'] as const,
  list: (query: CategoryListQuery) => [...categoryKeys.all, 'list', query] as const,
}

export const categoryListQuery = (query: CategoryListQuery) =>
  queryOptions({
    queryKey: categoryKeys.list(query),
    queryFn: () => categoryService.list(query),
    placeholderData: keepPreviousData,
  })
