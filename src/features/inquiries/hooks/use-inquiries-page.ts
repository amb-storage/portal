import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useListSearch } from '@/hooks/use-list-search'
import { LIST_LIMIT } from '@/lib/search'
import { inquiryService } from '../inquiry.service'
import { inquiryKeys, inquiryListQuery } from '../queries'
import type { InquirySearch } from '../search'

export function useInquiriesPage() {
  const { search, setSearch } = useListSearch<InquirySearch>()
  const list = useQuery(inquiryListQuery({ ...search, limit: LIST_LIMIT }))
  const unread = useQuery(inquiryListQuery({ page: 1, limit: 1, status: 'NEW' }))
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const openInquiry = (id: string) => navigate({ to: '/inquiries/$inquiryId', params: { inquiryId: id } })
  const resetSamples = async () => {
    await inquiryService.resetSamples()
    await queryClient.invalidateQueries({ queryKey: inquiryKeys.all })
  }
  return { search, setSearch, list, unreadCount: unread.data?.total ?? 0, openInquiry, resetSamples }
}
