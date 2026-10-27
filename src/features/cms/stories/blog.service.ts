import { api } from '@/lib/api/client'
import type { Paginated } from '@/lib/api/types'
import type { SectionRegistry } from '@/features/cms/pages/types'
import type { BlogPostDetail, BlogPostListQuery, BlogPostSummary, BlogPreview } from './blog.types'

const base = '/blog/posts'

export const blogService = {
  list: (query: BlogPostListQuery) => api.get<Paginated<BlogPostSummary>>(base, { ...query }),
  get: (id: string) => api.get<BlogPostDetail>(`${base}/${id}`),
  create: (slug: string) => api.post<BlogPostDetail>(base, { slug }),
  update: (id: string, body: { slug: string }) => api.patch<BlogPostDetail>(`${base}/${id}`, body),
  updateDraft: (id: string, body: Record<string, unknown>) => api.put<BlogPostDetail>(`${base}/${id}/draft`, body),
  publish: (id: string, body: { draftVersionId: string; expectedRevision: number }) => api.post<BlogPostDetail>(`${base}/${id}/publish`, body),
  unpublish: (id: string) => api.post<BlogPostDetail>(`${base}/${id}/unpublish`),
  archive: (id: string) => api.post<BlogPostDetail>(`${base}/${id}/archive`),
  preview: (id: string) => api.post<BlogPreview>(`${base}/${id}/preview`),
  sectionRegistry: () => api.get<SectionRegistry>('/blog/section-registry'),
}
