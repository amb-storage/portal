import { keepPreviousData, queryOptions } from '@tanstack/react-query'
import { inquiryService } from './inquiry.service'
import type { InquiryListQuery } from './types'

export const inquiryKeys = {
  all: ['inquiries'] as const,
  list: (query: InquiryListQuery) => [...inquiryKeys.all, 'list', query] as const,
  detail: (id: string) => [...inquiryKeys.all, 'detail', id] as const,
}

export const inquiryListQuery = (query: InquiryListQuery) =>
  queryOptions({ queryKey: inquiryKeys.list(query), queryFn: () => inquiryService.list(query), placeholderData: keepPreviousData })

export const inquiryDetailQuery = (id: string) =>
  queryOptions({ queryKey: inquiryKeys.detail(id), queryFn: () => inquiryService.get(id) })
