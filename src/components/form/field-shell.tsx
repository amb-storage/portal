import type { ReactNode } from 'react'
import { Label } from '@/components/ui/label'
import { useFieldContext } from './form-context'

/** Normalizes TanStack Form errors (strings or Standard Schema issues). */
function errorText(errors: unknown[]): string | undefined {
  const messages = errors
    .map((error) => (typeof error === 'string' ? error : (error as { message?: string } | undefined)?.message))
    .filter(Boolean)
  return messages.length > 0 ? [...new Set(messages)].join(', ') : undefined
}

interface FieldShellProps {
  label?: string
  description?: string
  children: ReactNode
}

export function FieldShell({ label, description, children }: FieldShellProps) {
  const field = useFieldContext<unknown>()
  const error = field.state.meta.isTouched || field.form.state.submissionAttempts > 0
    ? errorText(field.state.meta.errors)
    : undefined

  return (
    <div className="grid gap-1.5">
      {label ? <Label htmlFor={field.name}>{label}</Label> : null}
      {children}
      {description && !error ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  )
}
