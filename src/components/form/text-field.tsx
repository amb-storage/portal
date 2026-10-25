import type { ComponentProps } from 'react'
import { Input } from '@/components/ui/input'
import { FieldShell } from './field-shell'
import { useFieldInvalid } from './use-field-invalid'
import { useFieldContext } from './form-context'

type TextFieldProps = { label?: string; description?: string } & Omit<
  ComponentProps<typeof Input>,
  'value' | 'onChange' | 'onBlur' | 'name' | 'id'
>

export function TextField({ label, description, ...props }: TextFieldProps) {
  const field = useFieldContext<string | null | undefined>()
  const invalid = useFieldInvalid()
  return (
    <FieldShell label={label} description={description}>
      <Input
        id={field.name}
        name={field.name}
        value={field.state.value ?? ''}
        onChange={(event) => field.handleChange(event.target.value)}
        onBlur={field.handleBlur}
        aria-invalid={invalid}
        {...props}
      />
    </FieldShell>
  )
}
