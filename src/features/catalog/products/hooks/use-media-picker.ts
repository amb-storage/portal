import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { mediaListQuery } from '@/features/media/queries'
import type { MediaAsset } from '@/features/media/types'

const PICKER_LIMIT = 12

/** Only READY media may be attached to a product. */
export function useMediaPicker() {
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Map<string, MediaAsset>>(new Map())
  const list = useQuery(mediaListQuery({ page, limit: PICKER_LIMIT, status: 'READY' }))

  const toggle = (asset: MediaAsset) =>
    setSelected((current) => {
      const next = new Map(current)
      if (next.has(asset.id)) next.delete(asset.id)
      else next.set(asset.id, asset)
      return next
    })

  return { page, setPage, limit: PICKER_LIMIT, list, selected, toggle, clear: () => setSelected(new Map()) }
}
