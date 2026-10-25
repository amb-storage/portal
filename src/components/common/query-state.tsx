import type { ReactNode } from 'react'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { describeError } from '@/lib/api/errors'

export function ErrorAlert({ error, title = 'Có lỗi xảy ra' }: { error: unknown; title?: string }) {
  if (!error) return null
  return (
    <Alert variant="destructive">
      <AlertCircle />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{describeError(error)}</AlertDescription>
    </Alert>
  )
}

interface QueryStateProps<T> {
  query: { data: T | undefined; error: unknown; isPending: boolean }
  children: (data: T) => ReactNode
}

/** Renders skeleton / error / content for a single TanStack Query result. */
export function QueryState<T>({ query, children }: QueryStateProps<T>) {
  if (query.error) return <ErrorAlert error={query.error} />
  if (query.isPending || query.data === undefined) return <LoadingBlock />
  return <>{children(query.data)}</>
}

export function LoadingBlock() {
  return (
    <div className="grid gap-3">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-32 w-full" />
    </div>
  )
}
