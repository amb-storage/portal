import { api } from '@/lib/api/client'
import type { Paginated } from '@/lib/api/types'
import type { Category, CategoryListQuery } from './types'

const path = (id: string) => `/catalog/categories/${id}`

/** /api/v1/admin/catalog/categories (GET/POST, PATCH/DELETE :id). */
export const categoryService = {
  list: (query: CategoryListQuery) => api.get<Paginated<Category>>('/catalog/categories', { ...query }),
  create: (body: Record<string, unknown>) => api.post<{ category: Category }>('/catalog/categories', body),
  update: (id: string, body: Record<string, unknown>) => api.patch<{ category: Category }>(path(id), body),
  remove: (id: string) => api.delete<{ status: 'ok' }>(path(id)),
}
