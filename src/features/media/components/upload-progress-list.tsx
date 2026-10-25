import { CheckCircle2, Loader2, X, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type { UploadItem } from '../hooks/use-media-upload'

const STAGE_LABEL = { uploading: 'Đang tải', finalizing: 'Đang xử lý', done: 'Xong', failed: 'Lỗi' } as const

function StageIcon({ stage }: { stage: UploadItem['stage'] }) {
  if (stage === 'done') return <CheckCircle2 className="size-4 text-primary" />
  if (stage === 'failed') return <XCircle className="size-4 text-destructive" />
  return <Loader2 className="size-4 animate-spin text-muted-foreground" />
}

interface UploadProgressListProps {
  items: UploadItem[]
  busy: boolean
  onDismiss: () => void
}

export function UploadProgressList({ items, busy, onDismiss }: UploadProgressListProps) {
  if (items.length === 0) return null
  return (
    <Card className="py-3">
      <CardContent className="grid gap-3 px-4">
        <div className="flex items-center justify-between text-sm font-medium">
          Tải lên
          {busy ? null : (
            <Button size="icon" variant="ghost" aria-label="Đóng" onClick={onDismiss}>
              <X />
            </Button>
          )}
        </div>
        {items.map((item) => (
          <div key={item.key} className="grid gap-1.5">
            <div className="flex items-center gap-2 text-sm">
              <StageIcon stage={item.stage} />
              <span className="flex-1 truncate">{item.name}</span>
              <span className="text-xs tabular-nums text-muted-foreground">
                {STAGE_LABEL[item.stage]} · {item.percent}%
              </span>
            </div>
            <Progress value={item.percent} />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
