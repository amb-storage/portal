import { Fragment } from 'react'
import { ArrowDown, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { GuideDiagram, StepTone } from '../guide-content'

const TONES: Record<StepTone, string> = {
  neutral: 'border-border bg-card',
  draft: 'border-dashed border-muted-foreground/40 bg-muted/50',
  live: 'border-emerald-300 bg-emerald-50 dark:border-emerald-400/40 dark:bg-emerald-400/10',
  warn: 'border-amber-300 bg-amber-50 dark:border-amber-400/40 dark:bg-amber-400/10',
  done: 'border-border bg-muted',
}

/** Legend for the step colours, shown once at the top of the guide. */
export function ToneLegend() {
  const items: Array<[StepTone, string]> = [
    ['draft', 'Chỉ Admin thấy'],
    ['live', 'Khách thấy trên website'],
    ['warn', 'Cần bạn để ý / xử lý'],
  ]
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
      {items.map(([tone, label]) => (
        <li key={tone} className="flex items-center gap-1.5">
          <span className={cn('size-3 rounded-sm border', TONES[tone])} aria-hidden="true" />
          {label}
        </li>
      ))}
    </ul>
  )
}

export function GuideDiagramView({ diagram }: { diagram: GuideDiagram }) {
  return (
    <figure className="grid gap-2">
      {diagram.kind === 'flow' ? (
        <ol className="flex flex-col items-stretch gap-1 md:flex-row md:items-stretch">
          {diagram.steps.map((step, index) => (
            <Fragment key={step.label}>
              {index > 0 ? (
                <li aria-hidden="true" className="flex shrink-0 items-center justify-center text-muted-foreground">
                  <ArrowDown className="size-4 md:hidden" />
                  <ArrowRight className="hidden size-4 md:block" />
                </li>
              ) : null}
              <li className={cn('grid min-w-0 flex-1 content-start gap-0.5 rounded-lg border px-3 py-2', TONES[step.tone ?? 'neutral'])}>
                <span className="text-sm font-medium">
                  <span className="mr-1.5 text-xs text-muted-foreground tabular-nums">{index + 1}</span>
                  {step.label}
                </span>
                {step.note ? <span className="text-xs text-muted-foreground">{step.note}</span> : null}
              </li>
            </Fragment>
          ))}
        </ol>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <div className="grid grid-cols-[1fr_auto_1.4fr] gap-x-3 bg-muted/60 px-3 py-2 text-xs font-medium text-muted-foreground">
            <span>{diagram.fromTitle}</span>
            <span aria-hidden="true" />
            <span>{diagram.toTitle}</span>
          </div>
          <ul className="divide-y">
            {diagram.rows.map((row) => (
              <li key={row.from} className="grid grid-cols-[1fr_auto_1.4fr] items-center gap-x-3 px-3 py-2 text-sm">
                <span className="min-w-0 font-medium break-words">{row.from}</span>
                <ArrowRight className="size-4 text-muted-foreground" aria-label="hiện thành" />
                <span className="min-w-0 break-words text-muted-foreground">{row.to}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {diagram.caption ? <figcaption className="text-xs leading-5 text-muted-foreground">{diagram.caption}</figcaption> : null}
    </figure>
  )
}
