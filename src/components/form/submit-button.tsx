import type { ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useFormContext } from './form-context'

interface SubmitButtonProps {
  children: ReactNode
  disabled?: boolean
  /** Require at least one change before enabling (edit forms). */
  requireDirty?: boolean
}

export function SubmitButton({ children, disabled, requireDirty }: SubmitButtonProps) {
  const form = useFormContext()
  return (
    <form.Subscribe selector={(state) => [state.isSubmitting, state.isDirty] as const}>
      {([isSubmitting, isDirty]) => (
        <Button type="submit" disabled={disabled || isSubmitting || (requireDirty && !isDirty)}>
          {isSubmitting ? <Loader2 className="animate-spin" /> : null}
          {children}
        </Button>
      )}
    </form.Subscribe>
  )
}
