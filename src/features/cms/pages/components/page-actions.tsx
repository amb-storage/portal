import { Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfirmButton } from '@/components/common/confirm-button'
import type { CmsPage } from '../types'

interface PageActionsProps {
  page: CmsPage
  hasDraft: boolean
  canEdit: boolean
  canPublish: boolean
  canPreview: boolean
  /** Publish checklist satisfied (based on the saved draft). */
  ready: boolean
  isPending: boolean
  onAction: (action: 'publish' | 'unpublish' | 'archive') => void
  onPreview: () => void
}

export function PageActions({ page, hasDraft, canEdit, canPublish, canPreview, ready, isPending, onAction, onPreview }: PageActionsProps) {
  return (
    <>
      {canPreview && hasDraft ? (
        <Button variant="outline" onClick={onPreview}>
          <Eye /> Xem trước
        </Button>
      ) : null}
      {canPublish && hasDraft ? (
        <ConfirmButton
          disabled={isPending || !ready}
          title="Xuất bản bản nháp hiện tại?"
          description="Bản nháp sẽ trở thành phiên bản công khai."
          confirmLabel="Xuất bản"
          onConfirm={() => onAction('publish')}
        >
          {ready ? 'Xuất bản' : 'Chưa đủ điều kiện xuất bản'}
        </ConfirmButton>
      ) : null}
      {canPublish && page.publishedVersionId ? (
        <ConfirmButton
          variant="outline"
          disabled={isPending}
          title="Huỷ xuất bản trang?"
          description="Trang sẽ không còn hiển thị công khai."
          confirmLabel="Huỷ xuất bản"
          onConfirm={() => onAction('unpublish')}
        >
          Huỷ xuất bản
        </ConfirmButton>
      ) : null}
      {canEdit ? (
        <ConfirmButton
          variant="destructive"
          disabled={isPending}
          title="Xoá trang này?"
          description="Trang sẽ bị gỡ khỏi website và không khôi phục được. Nhớ gỡ các mục menu đang trỏ tới trang này."
          confirmLabel="Xoá"
          onConfirm={() => onAction('archive')}
        >
          Xoá trang
        </ConfirmButton>
      ) : null}
    </>
  )
}
