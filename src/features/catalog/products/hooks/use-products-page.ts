import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useCan } from '@/features/auth/hooks/use-permission'
import { useCategoryOptions } from '@/features/catalog/categories/hooks/use-category-options'
import { useListSearch } from '@/hooks/use-list-search'
import { PERMISSIONS } from '@/lib/permissions'
import { LIST_LIMIT } from '@/lib/search'
import { productListQuery } from '../queries'
import type { ProductSearch } from '../search'

export function useProductsPage() {
  const { search, setSearch } = useListSearch<ProductSearch>()
  const canManage = useCan(PERMISSIONS.catalogManage)
  const categories = useCategoryOptions()
  const list = useQuery(productListQuery({ ...search, limit: LIST_LIMIT }))
  const navigate = useNavigate()
  const openProduct = (id: string) => navigate({ to: '/catalog/products/$productId', params: { productId: id } })

  return { search, setSearch, list, canManage, categoryOptions: categories.options, openProduct }
}
