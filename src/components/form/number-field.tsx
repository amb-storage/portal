import { Input } from '@/components/ui/input'
import { FieldShell } from './field-shell'
import { useFieldInvalid } from './use-field-invalid'
import { useFieldContext } from './form-context'

interface NumberFieldProps {
  label?: string
  description?: string
  min?: number
  step?: number
  placeholder?: string
}

/** Keeps the value as number | undefined so it maps 1:1 to integer DTO fields. */
export function NumberField({ label, description, ...props }: NumberFieldProps) {
  const field = useFieldContext<number | undefined>()
  const invalid = useFieldInvalid()
  return (
    <FieldShell label={label} description={description}>
      <Input
        id={field.name}
        type="number"
        inputMode="numeric"
        value={field.state.value ?? ''}
        onChange={(event) => {
          const raw = event.target.value
          field.handleChange(raw === '' ? undefined : Number(raw))
        }}
        onBlur={field.handleBlur}
        aria-invalid={invalid}
        {...props}
      />
    </FieldShell>
  )
}
