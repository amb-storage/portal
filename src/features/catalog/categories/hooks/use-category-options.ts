import { useQuery } from '@tanstack/react-query'
import type { SelectOption } from '@/components/form/select-field'
import { categoryListQuery } from '../queries'

/** ACTIVE categories as select options (API max page size is 100). */
export function useCategoryOptions() {
  const query = useQuery(categoryListQuery({ page: 1, limit: 100 }))
  const options: SelectOption[] = (query.data?.items ?? []).map((item) => ({
    value: item.id,
    label: `${item.name_en} (${item.slug})`,
  }))
  return { options, isLoading: query.isPending }
}
