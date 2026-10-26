import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { useCan } from '@/features/auth/hooks/use-permission'
import { useListSearch } from '@/hooks/use-list-search'
import { describeError } from '@/lib/api/errors'
import { PERMISSIONS } from '@/lib/permissions'
import { LIST_LIMIT } from '@/lib/search'
import { mediaService } from '../media.service'
import { mediaEverythingQuery, mediaFoldersQuery, mediaKeys, mediaListQuery } from '../queries'
import type { MediaSearch } from '../search'
import { folderAncestors, folderName, isInFolder, mediaFolderOf, parentFolder, ROOT_FOLDER, type MediaAsset } from '../types'
import { useDeleteFolder } from './use-delete-folder'
import { useMediaUpload } from './use-media-upload'

export function useMediaPage() {
  const { search, setSearch } = useListSearch<MediaSearch>()
  const canManage = useCan(PERMISSIONS.mediaManage)
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState<MediaAsset | null>(null)
  const [previewing, setPreviewing] = useState<MediaAsset | null>(null)
  const { folder: browsing, ...filters } = search
  const inFolder = browsing !== undefined

  // "All images" pages on the server; a folder view loads everything and filters by objectKey.
  const flat = useQuery({ ...mediaListQuery({ ...filters, limit: LIST_LIMIT }), enabled: !inFolder })
  const everything = useQuery({ ...mediaEverythingQuery({ status: filters.status, mimeType: filters.mimeType }), enabled: inFolder })
  const folderItems = inFolder
    ? (everything.data ?? []).filter((asset) => (mediaFolderOf(asset.objectKey) ?? ROOT_FOLDER) === browsing)
    : []
  const start = (search.page - 1) * LIST_LIMIT
  const list = inFolder
    ? {
        data: everything.data ? { items: folderItems.slice(start, start + LIST_LIMIT), total: folderItems.length } : undefined,
        error: everything.error,
        isPending: everything.isPending,
      }
    : { data: flat.data, error: flat.error, isPending: flat.isPending }

  const foldersQuery = useQuery(mediaFoldersQuery())
  // The API lists folders that hold images directly; add their parents so the tree is complete.
  const folders = [...new Set((foldersQuery.data ?? []).flatMap(folderAncestors))].sort()
  const subfolders = folders.filter((path) => (inFolder && browsing !== ROOT_FOLDER ? parentFolder(path) === browsing : !path.includes('/')))
  const countIn = (path: string) => everything.data?.filter((asset) => isInFolder(mediaFolderOf(asset.objectKey), path)).length

  // Uploads default to the folder being browsed; adopt changes during render, like SearchInput.
  const viewFolder = browsing && browsing !== ROOT_FOLDER ? browsing : ''
  const [folder, setFolder] = useState(viewFolder)
  const [syncedFolder, setSyncedFolder] = useState(viewFolder)
  if (syncedFolder !== viewFolder) {
    setSyncedFolder(viewFolder)
    setFolder(viewFolder)
  }

  const openFolder = (next: string | undefined) => setSearch({ folder: next, page: 1 })
  const deleteFolder = useDeleteFolder((deleted, result) => {
    // Leave the folder once it is gone; stay to show what is left otherwise.
    if (result.inUse === 0 && result.failed === 0 && browsing && isInFolder(browsing, deleted)) openFolder(parentFolder(deleted) ?? undefined)
  })
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

  const remove = useMutation({
    mutationFn: mediaService.remove,
    onSuccess: () => {
      toast.success('Đã xoá ảnh')
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

  return {
    search,
    setSearch,
    list,
    canManage,
    folder,
    setFolder,
    folders,
    browsing,
    openFolder,
    subfolders: subfolders.map((path) => ({ path, name: folderName(path), count: countIn(path) })),
    deleteFolder,
    upload,
    uploads,
    clearUploads,
    archive,
    remove,
    finalize,
    editing,
    setEditing,
    previewing,
    setPreviewing,
  }
}
