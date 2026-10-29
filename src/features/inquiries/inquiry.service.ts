import { api } from '@/lib/api/client'
import type { Paginated } from '@/lib/api/types'
import type { Inquiry, InquiryListQuery, InquiryUpdate } from './types'

/** Admin お問い合わせ inbox; messages come from the website contact form (POST /contact). */
export const inquiryService = {
  list: (query: InquiryListQuery) => api.get<Paginated<Inquiry>>('/inquiries', { ...query }),
  get: (id: string) => api.get<Inquiry>(`/inquiries/${id}`),
  /** Sets repliedAt the first time status becomes REPLIED; audited by the API. */
  update: (id: string, body: InquiryUpdate) => api.patch<Inquiry>(`/inquiries/${id}`, body),
}
