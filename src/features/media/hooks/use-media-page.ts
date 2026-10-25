import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { useCan } from '@/features/auth/hooks/use-permission'
import { useListSearch } from '@/hooks/use-list-search'
import { describeError } from '@/lib/api/errors'
import { PERMISSIONS } from '@/lib/permissions'
import { LIST_LIMIT } from '@/lib/search'
import { mediaService } from '../media.service'
import { mediaKeys, mediaListQuery } from '../queries'
import type { MediaSearch } from '../search'
import type { MediaAsset } from '../types'
import { useMediaUpload } from './use-media-upload'

export function useMediaPage() {
  const { search, setSearch } = useListSearch<MediaSearch>()
  const canManage = useCan(PERMISSIONS.mediaManage)
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState<MediaAsset | null>(null)
  const [previewing, setPreviewing] = useState<MediaAsset | null>(null)
  const list = useQuery(mediaListQuery({ ...search, limit: LIST_LIMIT }))
  const { upload, items: uploads, clearItems: clearUploads } = useMediaUpload()

  const invalidate = () => queryClient.invalidateQueries({ queryKey: mediaKeys.all })

  const archive = useMutation({
    mutationFn: mediaService.archive,
    onSuccess: () => {
      toast.success('Đã lưu trữ ảnh')
      return invalidate()
    },
    onError: (error) => toast.error(describeError(error)),
  })

  const finalize = useMutation({
    mutationFn: mediaService.finalize,
    onSuccess: (asset) => {
      toast.success(`Đã xử lý: ${asset.status}`)
      return invalidate()
    },
    onError: (error) => toast.error(describeError(error)),
  })

  return { search, setSearch, list, canManage, upload, uploads, clearUploads, archive, finalize, editing, setEditing, previewing, setPreviewing }
}
