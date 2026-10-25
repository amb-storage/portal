import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { JsonView } from '@/components/common/json-view'
import type { AuditLog } from '../types'

export function AuditDetailDialog({ entry, onClose }: { entry: AuditLog; onClose: () => void }) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{entry.action}</DialogTitle>
        </DialogHeader>
        <JsonView value={entry} />
      </DialogContent>
    </Dialog>
  )
}
