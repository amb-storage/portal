import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useCan } from '@/features/auth/hooks/use-permission'
import { useListSearch } from '@/hooks/use-list-search'
import { PERMISSIONS } from '@/lib/permissions'
import { LIST_LIMIT } from '@/lib/search'
import { pageListQuery } from '../queries'
import { useDeletePage } from './use-delete-page'
import type { CmsPageSearch } from '../search'

export function useCmsPagesPage() {
  const { search, setSearch } = useListSearch<CmsPageSearch>()
  const canEdit = useCan(PERMISSIONS.pageEdit)
  const [creating, setCreating] = useState(false)
  const list = useQuery(pageListQuery({ ...search, limit: LIST_LIMIT }))
  const navigate = useNavigate()
  const openPage = (pageId: string) => navigate({ to: '/cms/pages/$pageId', params: { pageId } })
  const remove = useDeletePage()
  return { search, setSearch, list, canEdit, creating, setCreating, openPage, remove }
}
