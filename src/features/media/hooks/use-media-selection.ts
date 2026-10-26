import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { describeError } from '@/lib/api/errors'
import { deleteMediaAssets, reportDeleteResult } from '../bulk-delete'
import { mediaKeys } from '../queries'

/**
 * Multi-select on the media grid. `scope` identifies what is on screen (folder, filters, page);
 * the selection resets whenever it changes so hidden images are never deleted by accident.
 */
export function useMediaSelection(scope: string) {
  const queryClient = useQueryClient()
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set())
  const [syncedScope, setSyncedScope] = useState(scope)
  if (syncedScope !== scope) {
    setSyncedScope(scope)
    setSelected(new Set())
  }

  const toggle = (id: string) =>
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const removeSelected = useMutation({
    mutationFn: (ids: string[]) => deleteMediaAssets(ids, 'ảnh đã chọn'),
    onSuccess: (result) => {
      reportDeleteResult(result, `Đã xoá ${result.deleted} ảnh`)
      // Keep what could not be deleted selected, so the Admin sees which ones remain.
      setSelected(new Set(result.keptIds))
    },
    onError: (error) => toast.error(describeError(error)),
    onSettled: () => queryClient.invalidateQueries({ queryKey: mediaKeys.all }),
  })

  return {
    selected,
    toggle,
    selectAll: (ids: string[]) => setSelected(new Set(ids)),
    clear: () => setSelected(new Set()),
    removeSelected,
  }
}
