import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useListSearch } from '@/hooks/use-list-search'
import { LIST_LIMIT } from '@/lib/search'
import { orderListQuery } from '../queries'
import type { OrderSearch } from '../search'

export function useOrdersPage() {
  const { search, setSearch } = useListSearch<OrderSearch>()
  const list = useQuery(orderListQuery({ ...search, limit: LIST_LIMIT }))
  const navigate = useNavigate()
  const openOrder = (id: string) => navigate({ to: '/orders/$orderId', params: { orderId: id } })
  return { search, setSearch, list, openOrder }
}
