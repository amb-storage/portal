import { FilterSelect, ListToolbar } from '@/components/common/list-toolbar'
import { PageHeader } from '@/components/common/page-header'
import { ErrorAlert } from '@/components/common/query-state'
import { DataTablePagination } from '@/components/data-table/data-table-pagination'
import { LIST_LIMIT } from '@/lib/search'
import { FolderBar } from '../components/folder-bar'
import { FolderTree } from '../components/folder-tree'
import { MediaAltDialog } from '../components/media-alt-dialog'
import { MediaGrid } from '../components/media-grid'
import { MediaPreviewDialog } from '../components/media-preview-dialog'
import { SelectionBar } from '../components/selection-bar'
import { UploadButton } from '../components/upload-button'
import { UploadFolderInput } from '../components/upload-folder-input'
import { UploadProgressList } from '../components/upload-progress-list'
import { useMediaPage } from '../hooks/use-media-page'
import type { MediaSearch } from '../search'
import { MEDIA_STATUSES, ROOT_FOLDER, SUPPORTED_MIME_TYPES } from '../types'

export function MediaPage() {
  const {
    search,
    setSearch,
    list,
    canManage,
    folder,
    setFolder,
    folders,
    browsing,
    openFolder,
    subfolders,
    deleteFolder,
    selection,
    pageIds,
    upload,
    uploads,
    clearUploads,
    archive,
    remove,
    finalize,
    editing,
    setEditing,
    previewing,
    setPreviewing,
  } = useMediaPage()

  return (
    <>
      <PageHeader
        title="Thư viện ảnh"
        description="JPEG, PNG, WebP hoặc AVIF, tối đa 20 MB mỗi ảnh."
        actions={
          canManage ? (
            <>
              <UploadFolderInput value={folder} onChange={setFolder} folders={folders} disabled={upload.isPending} />
              <UploadButton isUploading={upload.isPending} onFiles={(files) => upload.mutate({ files, folder })} />
            </>
          ) : null
        }
      />
      <UploadProgressList items={uploads} busy={upload.isPending} onDismiss={clearUploads} />
      <div className="grid items-start gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="min-w-0 lg:sticky lg:top-40">
          <FolderTree folders={folders} current={browsing} onSelect={openFolder} />
        </aside>
        <div className="grid min-w-0 gap-4">
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
          {browsing !== undefined ? (
            <FolderBar
              current={browsing}
              subfolders={subfolders}
              imageCount={list.data?.total}
              canManage={canManage}
              isDeleting={deleteFolder.isPending}
              onOpen={openFolder}
              onDelete={(folder) => deleteFolder.mutate(folder)}
            />
          ) : null}
          {canManage && selection.selected.size > 0 ? (
            <SelectionBar
              count={selection.selected.size}
              pageCount={pageIds.length}
              allOnPageSelected={pageIds.every((id) => selection.selected.has(id))}
              isDeleting={selection.removeSelected.isPending}
              onSelectPage={() => selection.selectAll(pageIds)}
              onClear={selection.clear}
              onDelete={() => selection.removeSelected.mutate([...selection.selected])}
            />
          ) : null}
          <MediaGrid
            items={list.data?.items}
            isLoading={list.isPending}
            canManage={canManage}
            onOpen={setPreviewing}
            onEdit={setEditing}
            onFinalize={(id) => finalize.mutate(id)}
            onArchive={(id) => archive.mutate(id)}
            onDelete={(id) => remove.mutate(id)}
            onOpenFolder={browsing === undefined ? openFolder : undefined}
            selected={canManage ? selection.selected : undefined}
            onToggleSelect={canManage ? selection.toggle : undefined}
            emptyMessage={
              browsing === undefined
                ? undefined
                : browsing === ROOT_FOLDER
                  ? 'Không có ảnh nào nằm ngoài thư mục.'
                  : subfolders.length
                    ? 'Không có ảnh nằm trực tiếp trong thư mục này. Mở thư mục con ở trên.'
                    : 'Thư mục trống.'
            }
          />
          <DataTablePagination page={search.page} limit={LIST_LIMIT} total={list.data?.total} onPageChange={(page) => setSearch({ page })} />
        </div>
      </div>
      {editing ? <MediaAltDialog asset={editing} onClose={() => setEditing(null)} /> : null}
      {previewing ? <MediaPreviewDialog asset={previewing} onClose={() => setPreviewing(null)} /> : null}
    </>
  )
}
