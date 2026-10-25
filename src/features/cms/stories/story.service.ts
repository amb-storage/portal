import { api } from '@/lib/api/client'
import type { Paginated } from '@/lib/api/types'
import type { Story, StoryListQuery } from './types'

/** /api/v1/admin/stories — content edits and publishing go through cmsPageService. */
export const storyService = {
  list: (query: StoryListQuery) => api.get<Paginated<Story>>('/stories', { ...query }),
  get: (id: string) => api.get<Story>(`/stories/${id}`),
  create: (slug: string) => api.post<Story>('/stories', { slug }),
  update: (id: string, body: { slug: string }) => api.patch<Story>(`/stories/${id}`, body),
  /** Archives the backing page and its versions. */
  remove: (id: string) => api.delete<Story>(`/stories/${id}`),
}
