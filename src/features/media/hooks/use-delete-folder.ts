import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { describeError, isApiError } from '@/lib/api/errors'
import { mediaService } from '../media.service'
import { mediaKeys } from '../queries'
import { isInFolder, mediaFolderOf } from '../types'

export interface DeleteFolderResult {
  deleted: number
  inUse: number
  failed: number
}

/**
 * The API has no folder resource: a folder is just an objectKey prefix and disappears once it
 * holds no images. "Deleting" one hard-deletes every image in it (and its subfolders), one by
 * one; images still used by a product or CMS content are refused with MEDIA_IN_USE and stay.
 */
export function useDeleteFolder(onDone?: (folder: string, result: DeleteFolderResult) => void) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (folder: string): Promise<DeleteFolderResult> => {
      const toastId = toast.loading(`Đang tìm ảnh trong “${folder}”…`)
      try {
        // Fresh and unfiltered: status/format filters on screen must not hide images from deletion.
        const targets = (await mediaService.listAll({})).filter((asset) => isInFolder(mediaFolderOf(asset.objectKey), folder))
        const result: DeleteFolderResult = { deleted: 0, inUse: 0, failed: 0 }
        for (const [index, asset] of targets.entries()) {
          toast.loading(`Đang xoá ${index + 1}/${targets.length} ảnh trong “${folder}”…`, { id: toastId })
          try {
            await mediaService.remove(asset.id)
            result.deleted++
          } catch (error) {
            if (isApiError(error) && error.code === 'MEDIA_IN_USE') result.inUse++
            else result.failed++
          }
        }
        toast.dismiss(toastId)
        return result
      } catch (error) {
        toast.dismiss(toastId)
        throw error
      }
    },
    onSuccess: (result, folder) => {
      if (result.inUse === 0 && result.failed === 0) toast.success(`Đã xoá thư mục “${folder}” (${result.deleted} ảnh)`)
      else
        toast.warning(
          [
            `Đã xoá ${result.deleted} ảnh trong “${folder}”.`,
            result.inUse ? `${result.inUse} ảnh đang được dùng ở sản phẩm hoặc trang/bài viết nên được giữ lại.` : '',
            result.failed ? `${result.failed} ảnh xoá lỗi, thử lại sau.` : '',
          ]
            .filter(Boolean)
            .join(' '),
          { duration: 10000 },
        )
      onDone?.(folder, result)
    },
    onError: (error) => toast.error(describeError(error)),
    onSettled: () => queryClient.invalidateQueries({ queryKey: mediaKeys.all }),
  })
}
