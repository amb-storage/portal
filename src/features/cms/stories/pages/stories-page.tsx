import { useMemo } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FilterSelect, ListToolbar, SearchInput } from '@/components/common/list-toolbar'
import { PageHeader } from '@/components/common/page-header'
import { ErrorAlert } from '@/components/common/query-state'
import { DataTable } from '@/components/data-table/data-table'
import { DataTablePagination } from '@/components/data-table/data-table-pagination'
import { LIST_LIMIT } from '@/lib/search'
import { CreateStoryDialog } from '../components/create-story-dialog'
import { buildStoryColumns } from '../components/stories-columns'
import { useStoriesPage } from '../hooks/use-stories-page'
import type { StorySearch } from '../search'
import { STORY_STATUSES } from '../types'

export function StoriesPage() {
  const { search, setSearch, list, canManage, creating, setCreating, remove, openStory } = useStoriesPage()
  const removeStory = remove.mutate
  const columns = useMemo(() => buildStoryColumns({ canManage, onDelete: (id) => removeStory(id) }), [canManage, removeStory])

  return (
    <>
      <PageHeader
        title="Bài viết"
        description="Bài viết hiển thị trên web với tên “Mili Talks”. Bấm vào bài để soạn và xuất bản."
        actions={canManage ? <Button onClick={() => setCreating(true)}><Plus /> Thêm bài viết</Button> : null}
      />
      <ListToolbar>
        <SearchInput value={search.q} onChange={(q) => setSearch({ q })} />
        <FilterSelect value={search.status} onChange={(status) => setSearch({ status: status as StorySearch['status'] })} options={STORY_STATUSES} placeholder="Tất cả" />
      </ListToolbar>
      <ErrorAlert error={list.error} />
      <DataTable
        columns={columns}
        data={list.data?.items}
        isLoading={list.isPending}
        getRowId={(row) => row.id}
        onRowClick={(row) => openStory(row.id)}
        emptyMessage="Chưa có bài viết nào."
      />
      <DataTablePagination page={search.page} limit={LIST_LIMIT} total={list.data?.total} onPageChange={(page) => setSearch({ page })} />
      {creating ? <CreateStoryDialog onClose={() => setCreating(false)} /> : null}
    </>
  )
}
