import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { MediaThumb } from '@/components/common/media-thumb'
import { ErrorAlert } from '@/components/common/query-state'
import { DataTablePagination } from '@/components/data-table/data-table-pagination'
import type { MediaAsset } from '@/features/media/types'
import { formatBytes } from '@/lib/format'
import { useMediaPicker } from '../hooks/use-media-picker'

interface MediaPickerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  excludeIds: string[]
  onPick: (assets: MediaAsset[]) => void
}

export function MediaPickerDialog({ open, onOpenChange, excludeIds, onPick }: MediaPickerDialogProps) {
  const { page, setPage, limit, list, selected, toggle, clear } = useMediaPicker()
  const items = (list.data?.items ?? []).filter((asset) => !excludeIds.includes(asset.id))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Chọn ảnh</DialogTitle>
          <DialogDescription>Ảnh đã sẵn sàng (READY) trong thư viện.</DialogDescription>
        </DialogHeader>
        <ErrorAlert error={list.error} />
        <ul className="grid max-h-[55vh] grid-cols-2 gap-3 overflow-y-auto p-0.5 sm:grid-cols-4">
          {items.map((asset) => (
            <li key={asset.id}>
              <label
                data-selected={selected.has(asset.id) || undefined}
                className="relative grid cursor-pointer gap-1 rounded-lg border p-1.5 text-xs hover:bg-muted/50 data-[selected]:border-primary data-[selected]:ring-2 data-[selected]:ring-primary/40"
              >
                <MediaThumb id={asset.id} status={asset.status} alt={asset.altEn ?? asset.altJa} className="aspect-square" />
                <Checkbox className="absolute top-3 left-3 bg-background" checked={selected.has(asset.id)} onCheckedChange={() => toggle(asset)} />
                <span className="truncate">{asset.originalFilename ?? asset.id}</span>
                <span className="text-muted-foreground">{formatBytes(asset.sizeBytes)}</span>
              </label>
            </li>
          ))}
          {list.isSuccess && items.length === 0 ? <li className="col-span-full text-sm text-muted-foreground">Không còn ảnh nào để chọn.</li> : null}
        </ul>
        <DataTablePagination page={page} limit={limit} total={list.data?.total} onPageChange={setPage} />
        <DialogFooter>
          <Button
            disabled={selected.size === 0}
            onClick={() => {
              onPick([...selected.values()])
              clear()
              onOpenChange(false)
            }}
          >
            Thêm {selected.size || ''} ảnh đã chọn
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
