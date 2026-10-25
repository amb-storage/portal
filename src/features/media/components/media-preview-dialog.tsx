import type { ReactNode } from 'react'
import { ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { MediaThumb } from '@/components/common/media-thumb'
import { StatusBadge } from '@/components/common/status-badge'
import { mediaUrl } from '@/lib/api/config'
import { formatBytes, formatDateTime } from '@/lib/format'
import type { MediaAsset } from '../types'

export function MediaPreviewDialog({ asset, onClose }: { asset: MediaAsset; onClose: () => void }) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="truncate pr-6">{asset.originalFilename ?? asset.id}</DialogTitle>
        </DialogHeader>
        <MediaThumb id={asset.id} status={asset.status} alt={asset.altEn ?? asset.altJa} fit="contain" className="h-[60vh] w-full" />
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <Row label="Trạng thái"><StatusBadge status={asset.status} /></Row>
          <Row label="Định dạng">{asset.mimeType}</Row>
          <Row label="Kích thước">{asset.width && asset.height ? `${asset.width}×${asset.height}` : '—'}</Row>
          <Row label="Dung lượng">{formatBytes(asset.sizeBytes)}</Row>
          <Row label="Tải lên">{formatDateTime(asset.createdAt)}</Row>
          <Row label="Alt (Nhật)">{asset.altJa || '—'}</Row>
          <Row label="Alt (Anh)">{asset.altEn || '—'}</Row>
        </dl>
        {asset.status === 'READY' ? (
          <div className="flex justify-end">
            <Button asChild variant="outline" size="sm">
              <a href={mediaUrl(asset.id)} target="_blank" rel="noreferrer">
                Mở ảnh gốc <ExternalLink />
              </a>
            </Button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[100px_1fr] gap-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words">{children}</dd>
    </div>
  )
}
