import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { FieldShell } from './field-shell'
import { useFieldInvalid } from './use-field-invalid'
import { useFieldContext } from './form-context'

interface TextareaFieldProps {
  label?: string
  description?: string
  rows?: number
  placeholder?: string
  monospace?: boolean
}

export function TextareaField({ label, description, monospace, ...props }: TextareaFieldProps) {
  const field = useFieldContext<string | null | undefined>()
  const invalid = useFieldInvalid()
  return (
    <FieldShell label={label} description={description}>
      <Textarea
        id={field.name}
        value={field.state.value ?? ''}
        onChange={(event) => field.handleChange(event.target.value)}
        onBlur={field.handleBlur}
        aria-invalid={invalid}
        className={cn(monospace && 'font-mono text-xs')}
        {...props}
      />
    </FieldShell>
  )
}
