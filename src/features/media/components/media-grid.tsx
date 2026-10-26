import { Archive, CheckCircle2, Folder, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmButton } from '@/components/common/confirm-button'
import { MediaThumb } from '@/components/common/media-thumb'
import { StatusBadge } from '@/components/common/status-badge'
import { formatBytes } from '@/lib/format'
import { cn } from '@/lib/utils'
import { mediaFolderOf, type MediaAsset } from '../types'

interface MediaGridProps {
  items: MediaAsset[] | undefined
  isLoading: boolean
  canManage: boolean
  onOpen: (asset: MediaAsset) => void
  onEdit: (asset: MediaAsset) => void
  onFinalize: (id: string) => void
  onArchive: (id: string) => void
  onDelete: (id: string) => void
  emptyMessage?: string
  onOpenFolder?: (folder: string) => void
  /** Multi-select; omit both to hide the checkboxes. */
  selected?: ReadonlySet<string>
  onToggleSelect?: (id: string) => void
}

export function MediaGrid({ items, isLoading, canManage, onOpen, onEdit, onFinalize, onArchive, onDelete, emptyMessage = 'Chưa có ảnh nào. Bấm “Tải ảnh lên” để bắt đầu.', onOpenFolder, selected, onToggleSelect }: MediaGridProps) {
  // Once something is selected, clicking a card extends the selection instead of opening it.
  const selecting = Boolean(selected?.size)
  if (isLoading && !items)
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 10 }, (_, index) => (
          <Skeleton key={index} className="aspect-square" />
        ))}
      </div>
    )
  if (!items?.length) return <p className="py-12 text-center text-sm text-muted-foreground">{emptyMessage}</p>

  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {items.map((asset) => {
        const folder = mediaFolderOf(asset.objectKey)
        return (
          <li
            key={asset.id}
            className={cn('group relative min-w-0 overflow-hidden rounded-xl border bg-card', selected?.has(asset.id) && 'border-primary ring-2 ring-primary')}
          >
            {onToggleSelect ? (
              <span
                className={cn(
                  'absolute top-2 right-2 z-10 rounded-md bg-background/90 p-1 shadow-sm transition-opacity',
                  selecting || selected?.has(asset.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus-within:opacity-100 pointer-coarse:opacity-100',
                )}
              >
                <Checkbox
                  checked={selected?.has(asset.id) ?? false}
                  onCheckedChange={() => onToggleSelect(asset.id)}
                  aria-label={`Chọn ${asset.originalFilename ?? 'ảnh'}`}
                  className="bg-background"
                />
              </span>
            ) : null}
            <button
              type="button"
              onClick={() => (selecting && onToggleSelect ? onToggleSelect(asset.id) : onOpen(asset))}
              className="relative block w-full"
              aria-label={selecting ? `Chọn ${asset.originalFilename ?? 'ảnh'}` : `Xem ${asset.originalFilename ?? 'ảnh'}`}
            >
              <MediaThumb id={asset.id} status={asset.status} alt={asset.altEn ?? asset.altJa} className="aspect-square rounded-none transition group-hover:opacity-90" />
              <span className="absolute top-2 left-2">
                <StatusBadge status={asset.status} />
              </span>
            </button>
            <div className="grid min-w-0 gap-1 p-3">
              <span className="truncate text-sm font-medium">{asset.originalFilename ?? asset.id}</span>
              <span className="truncate text-xs text-muted-foreground">
                {asset.width && asset.height ? `${asset.width}×${asset.height} · ` : ''}
                {formatBytes(asset.sizeBytes)}
              </span>
              {folder ? (
                <button
                  type="button"
                  disabled={!onOpenFolder}
                  onClick={() => onOpenFolder?.(folder)}
                  className="flex w-full min-w-0 items-center gap-1 text-left text-xs text-muted-foreground enabled:hover:text-foreground enabled:hover:underline"
                  title={onOpenFolder ? `Mở thư mục ${folder}` : folder}
                >
                  <Folder className="size-3 shrink-0" />
                  <span className="min-w-0 flex-1 truncate">{folder}</span>
                </button>
              ) : null}
              <span className="truncate text-xs text-muted-foreground">{asset.altEn || asset.altJa || 'Chưa có mô tả'}</span>
              {canManage ? (
                <div className="-mb-1 flex justify-end gap-1">
                  {asset.status === 'PENDING' ? (
                    <Button size="icon" variant="ghost" aria-label="Hoàn tất xử lý" onClick={() => onFinalize(asset.id)}>
                      <CheckCircle2 />
                    </Button>
                  ) : null}
                  {asset.status !== 'ARCHIVED' ? (
                    <>
                      <Button size="icon" variant="ghost" aria-label="Sửa mô tả ảnh" onClick={() => onEdit(asset)}>
                        <Pencil />
                      </Button>
                      <ConfirmButton
                        size="icon"
                        variant="ghost"
                        aria-label="Lưu trữ"
                        title="Lưu trữ ảnh?"
                        description="Ảnh sẽ không hiển thị trên website nữa và không khôi phục được. Không lưu trữ được nếu ảnh thuộc sản phẩm đang bán; ảnh dùng trong trang hoặc bài viết đã xuất bản sẽ bị mất trên website."
                        confirmLabel="Lưu trữ"
                        onConfirm={() => onArchive(asset.id)}
                      >
                        <Archive />
                      </ConfirmButton>
                    </>
                  ) : null}
                  <ConfirmButton
                    size="icon"
                    variant="ghost"
                    aria-label="Xoá"
                    title="Xoá vĩnh viễn ảnh?"
                    description="Ảnh và tệp gốc trong kho lưu trữ sẽ bị xoá hẳn. Không xoá được nếu ảnh đang gắn với sản phẩm hoặc dùng trong trang/bài viết (kể cả bản nháp)."
                    confirmLabel="Xoá"
                    onConfirm={() => onDelete(asset.id)}
                  >
                    <Trash2 />
                  </ConfirmButton>
                </div>
              ) : null}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
