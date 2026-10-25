import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useFieldContext } from './form-context'

export function SwitchField({ label }: { label: string }) {
  const field = useFieldContext<boolean>()
  return (
    <div className="flex items-center gap-2">
      <Switch id={field.name} checked={field.state.value} onCheckedChange={field.handleChange} />
      <Label htmlFor={field.name}>{label}</Label>
    </div>
  )
}
