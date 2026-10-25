import axios from 'axios'
import { api } from '@/lib/api/client'
import { API_ORIGIN } from '@/lib/api/config'
import { ApiError } from '@/lib/api/errors'
import type { Paginated } from '@/lib/api/types'
import type { CmsPage, FixedContent, PageListRow, PageStatus, PageType, PageVersion, PreviewToken, SectionRegistry, VersionSummaryRow } from './types'

export interface PageListQuery {
  page: number
  limit: number
  q?: string
  type?: PageType
  status?: PageStatus
}

const base = (id: string) => `/cms/pages/${id}`

/** /api/v1/admin/cms/{pages,content-pages,section-registry} + public preview. */
export const cmsPageService = {
  list: (query: PageListQuery) => api.get<Paginated<PageListRow>>('/cms/pages', { ...query }),
  get: (id: string) => api.get<CmsPage>(base(id)),
  getDraft: (id: string) => api.get<PageVersion>(`${base(id)}/draft`),
  getFixed: (id: string) => api.get<FixedContent>(`/cms/content-pages/${id}`),
  listVersions: (id: string, page: number, limit: number) =>
    api.get<{ items: VersionSummaryRow[]; page: number; limit: number }>(`${base(id)}/versions`, { page, limit }),
  getVersion: (id: string, versionId: string) => api.get<PageVersion>(`${base(id)}/versions/${versionId}`),
  sectionRegistry: () => api.get<SectionRegistry>('/cms/section-registry'),
  create: (body: { slug: string; type: PageType }) => api.post<CmsPage>('/cms/pages', body),
  patch: (id: string, body: { slug: string }) => api.patch<CmsPage>(base(id), body),
  updateDraft: (id: string, body: Record<string, unknown>) => api.put<PageVersion>(`${base(id)}/draft`, body),
  updateFixed: (id: string, body: Record<string, unknown>) => api.put<FixedContent>(`/cms/content-pages/${id}`, body),
  publish: (id: string, body: { draftVersionId: string; expectedRevision: number }) => api.post<CmsPage>(`${base(id)}/publish`, body),
  unpublish: (id: string) => api.post<CmsPage>(`${base(id)}/unpublish`),
  archive: (id: string) => api.post<CmsPage>(`${base(id)}/archive`),
  rollback: (id: string, versionId: string) => api.post<CmsPage>(`${base(id)}/versions/${versionId}/rollback`),
  previewToken: (id: string) => api.post<PreviewToken>(`${base(id)}/preview-token`),

  /** Public preview endpoint; authenticated only by the short-lived token header. */
  async preview(pageId: string, token: string): Promise<unknown> {
    try {
      const { data } = await axios.get(`${API_ORIGIN}/api/v1/cms/preview/pages/${pageId}`, {
        headers: { 'X-CMS-Preview-Token': token, Accept: 'application/json' },
      })
      return data
    } catch (error) {
      if (axios.isAxiosError(error)) throw new ApiError(error.response?.status ?? 0, error.response?.data)
      throw error
    }
  },
}
