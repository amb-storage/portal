import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { describeError } from '@/lib/api/errors'
import { formatBytes } from '@/lib/format'
import { mediaService } from '../media.service'
import { mediaKeys } from '../queries'
import { MAX_MEDIA_SIZE_BYTES, SUPPORTED_MIME_TYPES } from '../types'

export type UploadStage = 'uploading' | 'finalizing' | 'done' | 'failed'

export interface UploadItem {
  key: string
  name: string
  percent: number
  stage: UploadStage
}

function validate(file: File) {
  if (!(SUPPORTED_MIME_TYPES as readonly string[]).includes(file.type)) {
    return `${file.name}: định dạng không hỗ trợ (${file.type || 'không rõ'})`
  }
  if (file.size < 1 || file.size > MAX_MEDIA_SIZE_BYTES) {
    return `${file.name}: dung lượng tối đa ${formatBytes(MAX_MEDIA_SIZE_BYTES)}`
  }
  return null
}

/**
 * Three-step upload per file: create intent → PUT to presigned URL (with
 * progress) → finalize. The object key stays server-side.
 */
export function useMediaUpload() {
  const queryClient = useQueryClient()
  const [items, setItems] = useState<UploadItem[]>([])

  const patch = useCallback(
    (key: string, next: Partial<UploadItem>) =>
      setItems((current) => current.map((item) => (item.key === key ? { ...item, ...next } : item))),
    [],
  )

  const uploadOne = useCallback(
    async (file: File, key: string) => {
      const intent = await mediaService.createUpload({ filename: file.name, mimeType: file.type, sizeBytes: file.size })
      await mediaService.uploadToStorage(intent, file, (event) => {
        patch(key, { percent: Math.round(((event.loaded ?? 0) / (event.total ?? file.size)) * 100) })
      })
      patch(key, { stage: 'finalizing', percent: 100 })
      return mediaService.finalize(intent.mediaId)
    },
    [patch],
  )

  const upload = useMutation({
    mutationFn: async (files: File[]) => {
      const valid = files.filter((file) => {
        const error = validate(file)
        if (error) toast.error(error)
        return !error
      })
      const queued = valid.map((file) => ({ file, key: `${file.name}-${crypto.randomUUID()}` }))
      setItems(queued.map(({ file, key }) => ({ key, name: file.name, percent: 0, stage: 'uploading' })))

      const results = await Promise.allSettled(queued.map(({ file, key }) => uploadOne(file, key)))
      results.forEach((result, index) => {
        const { file, key } = queued[index]
        patch(key, { stage: result.status === 'fulfilled' ? 'done' : 'failed' })
        if (result.status === 'rejected') toast.error(`${file.name}: ${describeError(result.reason)}`)
      })
      return results.filter((result) => result.status === 'fulfilled').length
    },
    onSuccess: async (count) => {
      if (count > 0) toast.success(`Đã tải lên ${count} ảnh`)
      await queryClient.invalidateQueries({ queryKey: mediaKeys.all })
    },
  })

  return { upload, items, clearItems: () => setItems([]) }
}
