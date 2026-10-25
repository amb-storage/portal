import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAppForm } from '@/components/form/form-hook'
import { describeError } from '@/lib/api/errors'
import { mediaService } from '../media.service'
import { mediaKeys } from '../queries'
import type { MediaAsset } from '../types'

export function useMediaAltForm(asset: MediaAsset, onDone: () => void) {
  const queryClient = useQueryClient()
  const save = useMutation({
    mutationFn: (body: { altJa: string; altEn: string }) => mediaService.update(asset.id, body),
    onSuccess: async () => {
      toast.success('Đã lưu mô tả ảnh')
      await queryClient.invalidateQueries({ queryKey: mediaKeys.all })
      onDone()
    },
    onError: (error) => toast.error(describeError(error)),
  })

  return useAppForm({
    defaultValues: { altJa: asset.altJa ?? '', altEn: asset.altEn ?? '' },
    onSubmit: ({ value }) => save.mutateAsync(value).catch(() => undefined),
  })
}
