import { cn } from '@/lib/utils'

/** Native overflow scrolling: max-height works without a fixed container height. */
export function JsonView({ value, className }: { value: unknown; className?: string }) {
  return (
    <div className={cn('max-h-[60vh] min-w-0 overflow-auto rounded-md border bg-muted/40', className)}>
      <pre className="p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap break-all">{JSON.stringify(value, null, 2)}</pre>
    </div>
  )
}
