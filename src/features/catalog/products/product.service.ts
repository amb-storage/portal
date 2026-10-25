import { api } from '@/lib/api/client'
import type { Paginated } from '@/lib/api/types'
import type { Product, ProductListQuery, ProductSummary, StockAdjustmentInput } from './types'

type ProductResponse = { product: Product }
const path = (id: string) => `/catalog/products/${id}`

/** /api/v1/admin/catalog/products/* (product, publication, stock, aliases, media). */
export const productService = {
  list: (query: ProductListQuery) => api.get<Paginated<ProductSummary>>('/catalog/products', { ...query }),
  get: async (id: string) => (await api.get<ProductResponse>(path(id))).product,
  create: (body: Record<string, unknown>) => api.post<ProductResponse>('/catalog/products', body),
  /** Generic PATCH never changes quantity; use adjustStock. */
  update: (id: string, body: Record<string, unknown>) => api.patch<ProductResponse>(path(id), body),
  publish: (id: string) => api.post<ProductResponse>(`${path(id)}/publish`),
  unpublish: (id: string) => api.post<ProductResponse>(`${path(id)}/unpublish`),
  adjustStock: (id: string, body: StockAdjustmentInput) =>
    api.post<ProductResponse>(`${path(id)}/stock-adjustments`, body),
  addAlias: (id: string, slug: string) => api.post<{ slug: string; productId: string }>(`${path(id)}/aliases`, { slug }),
  replaceMedia: (id: string, media: Array<{ mediaId: string; position: number }>) =>
    api.put<ProductResponse>(`${path(id)}/media`, { media }),
}
