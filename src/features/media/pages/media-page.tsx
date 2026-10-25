import { FilterSelect, ListToolbar } from '@/components/common/list-toolbar'
import { PageHeader } from '@/components/common/page-header'
import { ErrorAlert } from '@/components/common/query-state'
import { DataTablePagination } from '@/components/data-table/data-table-pagination'
import { LIST_LIMIT } from '@/lib/search'
import { MediaAltDialog } from '../components/media-alt-dialog'
import { MediaGrid } from '../components/media-grid'
import { MediaPreviewDialog } from '../components/media-preview-dialog'
import { UploadButton } from '../components/upload-button'
import { UploadProgressList } from '../components/upload-progress-list'
import { useMediaPage } from '../hooks/use-media-page'
import type { MediaSearch } from '../search'
import { MEDIA_STATUSES, SUPPORTED_MIME_TYPES } from '../types'

export function MediaPage() {
  const { search, setSearch, list, canManage, upload, uploads, clearUploads, archive, finalize, editing, setEditing, previewing, setPreviewing } =
    useMediaPage()

  return (
    <>
      <PageHeader
        title="Thư viện ảnh"
        description="JPEG, PNG, WebP hoặc AVIF, tối đa 20 MB mỗi ảnh."
        actions={canManage ? <UploadButton isUploading={upload.isPending} onFiles={(files) => upload.mutate(files)} /> : null}
      />
      <UploadProgressList items={uploads} busy={upload.isPending} onDismiss={clearUploads} />
      <ListToolbar>
        <FilterSelect
          value={search.status}
          onChange={(status) => setSearch({ status: status as MediaSearch['status'] })}
          options={MEDIA_STATUSES}
          placeholder="Mọi trạng thái"
        />
        <FilterSelect
          value={search.mimeType}
          onChange={(mimeType) => setSearch({ mimeType: mimeType as MediaSearch['mimeType'] })}
          options={SUPPORTED_MIME_TYPES}
          placeholder="Mọi định dạng"
        />
      </ListToolbar>
      <ErrorAlert error={list.error} />
      <MediaGrid
        items={list.data?.items}
        isLoading={list.isPending}
        canManage={canManage}
        onOpen={setPreviewing}
        onEdit={setEditing}
        onFinalize={(id) => finalize.mutate(id)}
        onArchive={(id) => archive.mutate(id)}
      />
      <DataTablePagination page={search.page} limit={LIST_LIMIT} total={list.data?.total} onPageChange={(page) => setSearch({ page })} />
      {editing ? <MediaAltDialog asset={editing} onClose={() => setEditing(null)} /> : null}
      {previewing ? <MediaPreviewDialog asset={previewing} onClose={() => setPreviewing(null)} /> : null}
    </>
  )
}
