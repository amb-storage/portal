import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { describeError } from '@/lib/api/errors'
import { deleteMediaAssets, reportDeleteResult, type DeleteResult } from '../bulk-delete'
import { mediaService } from '../media.service'
import { mediaKeys } from '../queries'
import { isInFolder, mediaFolderOf } from '../types'

/**
 * The API has no folder resource: a folder is just an objectKey prefix and disappears once it
 * holds no images. "Deleting" one hard-deletes every image in it (and its subfolders).
 */
export function useDeleteFolder(onDone?: (folder: string, result: DeleteResult) => void) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (folder: string) => {
      const toastId = toast.loading(`Đang tìm ảnh trong “${folder}”…`)
      // Fresh and unfiltered: status/format filters on screen must not hide images from deletion.
      const assets = await mediaService.listAll({}).finally(() => toast.dismiss(toastId))
      const ids = assets.filter((asset) => isInFolder(mediaFolderOf(asset.objectKey), folder)).map((asset) => asset.id)
      return deleteMediaAssets(ids, `ảnh trong “${folder}”`)
    },
    onSuccess: (result, folder) => {
      reportDeleteResult(result, `Đã xoá thư mục “${folder}” (${result.deleted} ảnh)`)
      onDone?.(folder, result)
    },
    onError: (error) => toast.error(describeError(error)),
    onSettled: () => queryClient.invalidateQueries({ queryKey: mediaKeys.all }),
  })
}
