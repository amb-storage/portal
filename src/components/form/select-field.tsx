import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FieldShell } from './field-shell'
import { useFieldInvalid } from './use-field-invalid'
import { useFieldContext } from './form-context'

export interface SelectOption {
  value: string
  label: string
}

/** Radix Select cannot hold '' so "none" is mapped to an empty string value. */
const NONE = '__none__'

interface SelectFieldProps {
  label?: string
  description?: string
  options: SelectOption[]
  placeholder?: string
  /** Adds a "None" option that sets the value to ''. */
  allowEmpty?: boolean
  disabled?: boolean
}

export function SelectField({ label, description, options, placeholder, allowEmpty, disabled }: SelectFieldProps) {
  const field = useFieldContext<string>()
  const invalid = useFieldInvalid()
  return (
    <FieldShell label={label} description={description}>
      <Select
        value={field.state.value === '' ? (allowEmpty ? NONE : '') : field.state.value}
        onValueChange={(value) => field.handleChange(value === NONE ? '' : value)}
        disabled={disabled}
      >
        <SelectTrigger id={field.name} className="w-full" aria-invalid={invalid} onBlur={field.handleBlur}>
          <SelectValue placeholder={placeholder ?? 'Chọn…'} />
        </SelectTrigger>
        <SelectContent>
          {allowEmpty ? <SelectItem value={NONE}>Không chọn</SelectItem> : null}
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FieldShell>
  )
}
