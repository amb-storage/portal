import { Fragment } from 'react'
import { ChevronRight, Folder, Trash2 } from 'lucide-react'
import { ConfirmButton } from '@/components/common/confirm-button'
import { folderAncestors, folderName, ROOT_FOLDER } from '../types'

interface FolderBarProps {
  current: string
  subfolders: Array<{ path: string; name: string; count: number | undefined }>
  /** Images directly in this folder (not counting subfolders). */
  imageCount: number | undefined
  canManage: boolean
  isDeleting: boolean
  onOpen: (folder: string | undefined) => void
  onDelete: (folder: string) => void
}

/** Breadcrumb, subfolder tiles and folder actions shown above the grid while browsing a folder. */
export function FolderBar({ current, subfolders, imageCount, canManage, isDeleting, onOpen, onDelete }: FolderBarProps) {
  const isRoot = current === ROOT_FOLDER
  const total = (imageCount ?? 0) + subfolders.reduce((sum, folder) => sum + (folder.count ?? 0), 0)

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <nav aria-label="Đường dẫn thư mục" className="flex min-w-0 flex-wrap items-center gap-1 text-sm">
          <button type="button" className="text-muted-foreground hover:text-foreground hover:underline" onClick={() => onOpen(undefined)}>
            Tất cả ảnh
          </button>
          {isRoot ? (
            <>
              <ChevronRight className="size-4 text-muted-foreground" />
              <span className="font-medium">Chưa phân thư mục</span>
            </>
          ) : (
            folderAncestors(current).map((path, index, all) => (
              <Fragment key={path}>
                <ChevronRight className="size-4 text-muted-foreground" />
                {index === all.length - 1 ? (
                  <span className="max-w-60 truncate font-medium" title={path}>
                    {folderName(path)}
                  </span>
                ) : (
                  <button type="button" className="max-w-40 truncate text-muted-foreground hover:text-foreground hover:underline" title={path} onClick={() => onOpen(path)}>
                    {folderName(path)}
                  </button>
                )}
              </Fragment>
            ))
          )}
        </nav>
        {canManage && !isRoot ? (
          <ConfirmButton
            variant="outline"
            size="sm"
            disabled={isDeleting}
            title={`Xoá thư mục “${current}”?`}
            description={
              <>
                Toàn bộ {total ? `${total} ` : ''}ảnh trong thư mục này và các thư mục con sẽ bị xoá vĩnh viễn, kể cả ảnh đã lưu trữ. Ảnh đang gắn với sản phẩm hoặc dùng trong
                trang/bài viết (kể cả bản nháp) không xoá được và sẽ được giữ lại, nên thư mục vẫn còn nếu có ảnh như vậy.
              </>
            }
            confirmLabel="Xoá thư mục"
            onConfirm={() => onDelete(current)}
          >
            <Trash2 /> Xoá thư mục
          </ConfirmButton>
        ) : null}
      </div>

      {subfolders.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {subfolders.map((folder) => (
            <li key={folder.path} className="min-w-0">
              <button
                type="button"
                title={folder.path}
                onClick={() => onOpen(folder.path)}
                className="flex w-full min-w-0 items-center gap-3 rounded-xl border bg-card p-3 text-left transition-colors hover:bg-muted"
              >
                <Folder className="size-8 shrink-0 text-primary" />
                <span className="grid min-w-0 flex-1">
                  <span className="truncate text-sm font-medium">{folder.name}</span>
                  <span className="text-xs text-muted-foreground">{folder.count === undefined ? 'Thư mục' : `${folder.count} ảnh`}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
