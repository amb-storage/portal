import { MultiSelect } from '@/components/common/multi-select'
import { FieldShell } from './field-shell'
import { useFieldContext } from './form-context'
import type { SelectOption } from './select-field'

interface MultiSelectFieldProps {
  label?: string
  description?: string
  options: SelectOption[]
  placeholder?: string
}

export function MultiSelectField({ label, description, options, placeholder }: MultiSelectFieldProps) {
  const field = useFieldContext<string[]>()
  return (
    <FieldShell label={label} description={description}>
      <MultiSelect
        options={options}
        value={field.state.value}
        onChange={field.handleChange}
        placeholder={placeholder}
      />
    </FieldShell>
  )
}
