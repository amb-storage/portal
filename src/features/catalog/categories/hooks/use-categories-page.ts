import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { useCan } from '@/features/auth/hooks/use-permission'
import { productKeys } from '@/features/catalog/products/queries'
import { useListSearch } from '@/hooks/use-list-search'
import { describeError } from '@/lib/api/errors'
import { PERMISSIONS } from '@/lib/permissions'
import { LIST_LIMIT } from '@/lib/search'
import { categoryService } from '../category.service'
import { categoryKeys, categoryListQuery } from '../queries'
import type { CategorySearch } from '../search'
import type { Category } from '../types'

/** null = closed, 'new' = create dialog, category = edit dialog. */
export type EditorState = null | 'new' | Category

export function useCategoriesPage() {
  const { search, setSearch } = useListSearch<CategorySearch>()
  const canManage = useCan(PERMISSIONS.catalogManage)
  const queryClient = useQueryClient()
  const [editor, setEditor] = useState<EditorState>(null)
  const list = useQuery(categoryListQuery({ page: search.page, limit: LIST_LIMIT }))

  const remove = useMutation({
    mutationFn: categoryService.remove,
    onSuccess: async () => {
      toast.success('Đã xoá danh mục')
      await queryClient.invalidateQueries({ queryKey: categoryKeys.all })
      await queryClient.invalidateQueries({ queryKey: productKeys.all })
    },
    onError: (error) => toast.error(describeError(error)),
  })

  return { search, setSearch, list, remove, canManage, editor, setEditor }
}
