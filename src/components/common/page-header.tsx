import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
}

/** Sticks under the app header (h-14); negative margins span the main padding. */
export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="sticky top-14 z-20 -mx-4 -mt-4 flex flex-wrap items-start justify-between gap-4 border-b bg-background/90 px-4 py-4 backdrop-blur md:-mx-6 md:-mt-6 md:px-6">
      <div className="grid gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  )
}
