import { keepPreviousData, queryOptions } from '@tanstack/react-query'
import { productService } from './product.service'
import type { ProductListQuery } from './types'

export const productKeys = {
  all: ['catalog', 'products'] as const,
  list: (query: ProductListQuery) => [...productKeys.all, 'list', query] as const,
  detail: (id: string) => [...productKeys.all, 'detail', id] as const,
}

export const productListQuery = (query: ProductListQuery) =>
  queryOptions({
    queryKey: productKeys.list(query),
    queryFn: () => productService.list(query),
    placeholderData: keepPreviousData,
  })

export const productDetailQuery = (id: string) =>
  queryOptions({ queryKey: productKeys.detail(id), queryFn: () => productService.get(id) })
