import { Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfirmButton } from '@/components/common/confirm-button'
import type { BlogPostDetail } from '../blog.types'

interface BlogPageActionsProps {
  post: BlogPostDetail
  canManage: boolean
  ready: boolean
  isPending: boolean
  onPreview: () => void
  onPublish: () => void
  onUnpublish: () => void
  onArchive: () => void
}

export function BlogPageActions({ post, canManage, ready, isPending, onPreview, onPublish, onUnpublish, onArchive }: BlogPageActionsProps) {
  if (!canManage) return null
  return (
    <>
      {post.draft ? <Button variant="outline" onClick={onPreview}><Eye /> Xem trước</Button> : null}
      {post.draft ? (
        <ConfirmButton disabled={isPending || !ready} title="Xuất bản bản nháp hiện tại?" description="Bản nháp sẽ trở thành phiên bản công khai." confirmLabel="Xuất bản" onConfirm={onPublish}>
          {ready ? 'Xuất bản' : 'Chưa đủ điều kiện xuất bản'}
        </ConfirmButton>
      ) : null}
      {post.published ? (
        <ConfirmButton variant="outline" disabled={isPending} title="Huỷ xuất bản bài viết?" description="Bài viết sẽ không còn hiển thị công khai." confirmLabel="Huỷ xuất bản" onConfirm={onUnpublish}>
          Huỷ xuất bản
        </ConfirmButton>
      ) : null}
      {post.pageStatus === 'ACTIVE' ? (
        <ConfirmButton variant="destructive" disabled={isPending} title="Lưu trữ bài viết?" description="Bài viết sẽ bị gỡ khỏi website và không còn sửa được." confirmLabel="Lưu trữ" onConfirm={onArchive}>
          Lưu trữ
        </ConfirmButton>
      ) : null}
    </>
  )
}
