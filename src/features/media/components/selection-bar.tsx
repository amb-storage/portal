import { CheckSquare, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfirmButton } from '@/components/common/confirm-button'

interface SelectionBarProps {
  count: number
  pageCount: number
  allOnPageSelected: boolean
  isDeleting: boolean
  onSelectPage: () => void
  onClear: () => void
  onDelete: () => void
}

/** Sticky actions for the images selected on the grid. */
export function SelectionBar({ count, pageCount, allOnPageSelected, isDeleting, onSelectPage, onClear, onDelete }: SelectionBarProps) {
  return (
    <div className="sticky top-36 z-10 flex flex-wrap items-center gap-2 rounded-xl border bg-background/95 px-3 py-2 shadow-sm backdrop-blur">
      <span className="text-sm font-medium">Đã chọn {count} ảnh</span>
      {!allOnPageSelected && pageCount > 0 ? (
        <Button size="sm" variant="ghost" onClick={onSelectPage}>
          <CheckSquare /> Chọn cả trang ({pageCount})
        </Button>
      ) : null}
      <Button size="sm" variant="ghost" onClick={onClear}>
        <X /> Bỏ chọn
      </Button>
      <ConfirmButton
        size="sm"
        variant="destructive"
        className="ml-auto"
        disabled={isDeleting}
        title={`Xoá vĩnh viễn ${count} ảnh?`}
        description="Ảnh và tệp gốc trong kho lưu trữ sẽ bị xoá hẳn. Ảnh đang gắn với sản phẩm hoặc dùng trong trang/bài viết (kể cả bản nháp) không xoá được và sẽ được giữ lại."
        confirmLabel={`Xoá ${count} ảnh`}
        onConfirm={onDelete}
      >
        <Trash2 /> Xoá {count} ảnh
      </ConfirmButton>
    </div>
  )
}
