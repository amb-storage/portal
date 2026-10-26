import { useState, type ComponentProps } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group'
import { FieldShell } from './field-shell'
import { useFieldInvalid } from './use-field-invalid'
import { useFieldContext } from './form-context'

type TextFieldProps = { label?: string; description?: string } & Omit<
  ComponentProps<typeof Input>,
  'value' | 'onChange' | 'onBlur' | 'name' | 'id'
>

export function TextField({ label, description, type, ...props }: TextFieldProps) {
  const field = useFieldContext<string | null | undefined>()
  const invalid = useFieldInvalid()
  const [revealed, setRevealed] = useState(false)
  const shared = {
    id: field.name,
    name: field.name,
    value: field.state.value ?? '',
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => field.handleChange(event.target.value),
    onBlur: field.handleBlur,
    'aria-invalid': invalid,
    ...props,
  }

  return (
    <FieldShell label={label} description={description}>
      {type === 'password' ? (
        // Show/hide toggle for every password input; the value never leaves the field.
        <InputGroup>
          <InputGroupInput {...shared} type={revealed ? 'text' : 'password'} />
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              size="icon-xs"
              aria-label={revealed ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              aria-pressed={revealed}
              title={revealed ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              onClick={() => setRevealed((value) => !value)}
            >
              {revealed ? <EyeOff /> : <Eye />}
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      ) : (
        <Input {...shared} type={type} />
      )}
    </FieldShell>
  )
}
