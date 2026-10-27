import { api } from '@/lib/api/client'
import type { Paginated } from '@/lib/api/types'
import type { Story, StoryDetail, StoryListQuery, StoryWrite } from './types'

/**
 * /api/v1/admin/stories: the only Admin API for Mili Talks articles (ADMIN_API_MAPPING.md).
 * Saving a published Story publishes the new content in the same request.
 */
export const storyService = {
  list: (query: StoryListQuery) => api.get<Paginated<Story>>('/stories', { ...query }),
  get: (id: string) => api.get<StoryDetail>(`/stories/${id}`),
  create: (body: StoryWrite & { slug: string }) => api.post<StoryDetail>('/stories', body),
  update: (id: string, body: StoryWrite) => api.patch<StoryDetail>(`/stories/${id}`, body),
  publish: (id: string) => api.post<StoryDetail>(`/stories/${id}/publish`),
  unpublish: (id: string) => api.post<StoryDetail>(`/stories/${id}/unpublish`),
  /** Archives the backing page and its versions; published data is not hard-deleted. */
  remove: (id: string) => api.delete<StoryDetail>(`/stories/${id}`),
}
