import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import type { MediaAsset } from '@/features/media/types'
import { describeError } from '@/lib/api/errors'
import { productService } from '../product.service'
import { productKeys } from '../queries'
import type { Product } from '../types'

export interface MediaSlot {
  id: string
  label: string
  mimeType: string
  status: string
}

function fromProduct(product: Product): MediaSlot[] {
  return product.media.map((row) => ({
    id: row.id,
    label: row.original_filename ?? row.id,
    mimeType: row.mime_type,
    status: row.status,
  }))
}

/** Local ordered draft of product media; saved with PUT /products/:id/media. */
export function useProductMediaTab(product: Product) {
  const queryClient = useQueryClient()
  const [slots, setSlots] = useState(() => fromProduct(product))
  const [pickerOpen, setPickerOpen] = useState(false)
  const dirty = JSON.stringify(slots.map((s) => s.id)) !== JSON.stringify(product.media.map((m) => m.id))

  const move = (index: number, delta: number) =>
    setSlots((current) => {
      const next = [...current]
      const target = index + delta
      if (target < 0 || target >= next.length) return current
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })

  const remove = (id: string) => setSlots((current) => current.filter((slot) => slot.id !== id))

  const add = (assets: MediaAsset[]) =>
    setSlots((current) => [
      ...current,
      ...assets
        .filter((asset) => !current.some((slot) => slot.id === asset.id))
        .map((asset) => ({ id: asset.id, label: asset.originalFilename ?? asset.id, mimeType: asset.mimeType, status: asset.status })),
    ])

  const save = useMutation({
    mutationFn: () => productService.replaceMedia(product.id, slots.map((slot, position) => ({ mediaId: slot.id, position }))),
    onSuccess: async ({ product: updated }) => {
      toast.success('Đã lưu ảnh')
      queryClient.setQueryData(productKeys.detail(product.id), updated)
      setSlots(fromProduct(updated))
    },
    onError: (error) => toast.error(describeError(error)),
  })

  return {
    slots, dirty, move, remove, add, save, pickerOpen, setPickerOpen,
    reset: () => setSlots(fromProduct(product)),
  }
}
