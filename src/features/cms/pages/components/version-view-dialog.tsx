import { useQuery } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { JsonView } from '@/components/common/json-view'
import { QueryState } from '@/components/common/query-state'
import { pageVersionQuery } from '../queries'

export function VersionViewDialog({ pageId, versionId, onClose }: { pageId: string; versionId: string; onClose: () => void }) {
  const version = useQuery(pageVersionQuery(pageId, versionId))
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Version {version.data ? `v${version.data.version} (${version.data.status})` : ''}</DialogTitle>
          <DialogDescription>{version.data?.titleEn ?? version.data?.titleJa ?? ''}</DialogDescription>
        </DialogHeader>
        <QueryState query={version}>{(data) => <JsonView value={data} />}</QueryState>
      </DialogContent>
    </Dialog>
  )
}
