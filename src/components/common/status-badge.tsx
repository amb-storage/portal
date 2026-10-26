import { Badge } from '@/components/ui/badge'
import { statusLabel } from '@/lib/labels'
import { cn } from '@/lib/utils'

type Tone = 'success' | 'warning' | 'info' | 'danger' | 'neutral'

/** Status colors are reserved for state and always ship with a text label. */
const TONES: Record<string, Tone> = {
  ACTIVE: 'success',
  PUBLISHED: 'success',
  READY: 'success',
  PAID: 'success',
  DELIVERED: 'success',
  SUCCESS: 'success',
  DRAFT: 'neutral',
  ARCHIVED: 'neutral',
  CANCELLED: 'neutral',
  PENDING: 'warning',
  PENDING_PAYMENT: 'warning',
  UNFULFILLED: 'warning',
  SHIPPED: 'info',
  NEW: 'warning',
  READ: 'info',
  REPLIED: 'success',
  FAILED: 'danger',
  FAILURE: 'danger',
  PAYMENT_FAILED: 'danger',
}

const TONE_CLASSES: Record<Tone, string> = {
  success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-300',
  warning: 'bg-amber-100 text-amber-900 dark:bg-amber-400/15 dark:text-amber-300',
  info: 'bg-sky-100 text-sky-800 dark:bg-sky-400/15 dark:text-sky-300',
  danger: 'bg-red-100 text-red-800 dark:bg-red-400/15 dark:text-red-300',
  neutral: 'bg-muted text-muted-foreground',
}

export function StatusBadge({ status }: { status: string | null | undefined }) {
  if (!status) return <span className="text-muted-foreground">—</span>
  const tone = TONES[status] ?? 'neutral'
  return (
    <Badge variant="outline" className={cn('border-transparent', TONE_CLASSES[tone])}>
      {statusLabel(status)}
    </Badge>
  )
}
