import { toast } from 'sonner'
import { isApiError } from '@/lib/api/errors'
import { mediaService } from './media.service'

export interface DeleteResult {
  deleted: number
  inUse: number
  failed: number
  /** Ids the API refused or failed on; they stay in the library. */
  keptIds: string[]
}

/**
 * The API deletes one asset per request, so bulk actions delete sequentially. Images still used
 * by a product or CMS content are refused with MEDIA_IN_USE and kept; the rest carries on.
 */
export async function deleteMediaAssets(ids: string[], label: string): Promise<DeleteResult> {
  const toastId = toast.loading(`Đang xoá 0/${ids.length} ${label}…`)
  const result: DeleteResult = { deleted: 0, inUse: 0, failed: 0, keptIds: [] }
  try {
    for (const [index, id] of ids.entries()) {
      toast.loading(`Đang xoá ${index + 1}/${ids.length} ${label}…`, { id: toastId })
      try {
        await mediaService.remove(id)
        result.deleted++
      } catch (error) {
        if (isApiError(error) && error.code === 'MEDIA_IN_USE') result.inUse++
        else result.failed++
        result.keptIds.push(id)
      }
    }
  } finally {
    toast.dismiss(toastId)
  }
  return result
}

export function reportDeleteResult(result: DeleteResult, successMessage: string) {
  if (result.inUse === 0 && result.failed === 0) {
    toast.success(successMessage)
    return
  }
  toast.warning(
    [
      `Đã xoá ${result.deleted} ảnh.`,
      result.inUse ? `${result.inUse} ảnh đang được dùng ở sản phẩm hoặc trang/bài viết nên được giữ lại.` : '',
      result.failed ? `${result.failed} ảnh xoá lỗi, thử lại sau.` : '',
    ]
      .filter(Boolean)
      .join(' '),
    { duration: 10000 },
  )
}
