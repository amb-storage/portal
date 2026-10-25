import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { isSingleMedia, settingIssue } from './document'
import { enumLabel, settingLabel } from './labels'
import { MediaSetting } from './media-setting'
import { ReferencePicker } from './reference-picker'
import { emptyRichText, isRichText } from './rich-text'
import { RichTextEditor } from './rich-text-editor'
import { ProductSourceSetting, TalkSourceSetting } from './source-setting'
import type { RichNode, SettingDef } from './types'

const DEFAULT = '__default__'
/** Longer free text gets a textarea instead of a single-line input. */
const LONG_TEXT = new Set(['text', 'excerptJa', 'excerptEn'])

interface SettingFieldProps {
  setting: SettingDef
  value: unknown
  onChange: (value: unknown) => void
  /** Stable id for uncontrolled editors (rich text). */
  editorKey: string
  readOnly?: boolean
}

export function SettingField({ setting, value, onChange, editorKey, readOnly }: SettingFieldProps) {
  const issue = settingIssue(setting, value)
  const id = `${editorKey}-${setting.key}`
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id} className="flex items-center gap-1">
        {settingLabel(setting.key, setting.label)}
        {setting.required ? <span className="text-destructive">*</span> : null}
      </Label>
      <Control id={id} setting={setting} value={value} onChange={onChange} editorKey={editorKey} readOnly={readOnly} />
      {issue && value !== undefined ? <p className="text-xs text-destructive">{issue}</p> : null}
      {issue && value === undefined ? <p className="text-xs text-muted-foreground">Chưa điền</p> : null}
    </div>
  )
}

function Control({ id, setting, value, onChange, editorKey, readOnly }: SettingFieldProps & { id: string }) {
  switch (setting.kind) {
    case 'richText':
      return (
        <RichTextEditor
          key={`${editorKey}-${setting.key}`}
          value={isRichText(value) ? value : emptyRichText()}
          onChange={(next: RichNode) => onChange(next)}
          readOnly={readOnly}
        />
      )
    case 'media': {
      const multiple = !isSingleMedia(setting)
      const ids = multiple ? (Array.isArray(value) ? (value as string[]) : []) : typeof value === 'string' ? [value] : []
      return <MediaSetting value={ids} multiple={multiple} readOnly={readOnly} onChange={(next) => onChange(multiple ? next : next[0])} />
    }
    case 'enum':
      return (
        <Select value={typeof value === 'string' ? value : DEFAULT} onValueChange={(next) => onChange(next === DEFAULT ? undefined : next)} disabled={readOnly}>
          <SelectTrigger id={id} className="w-full sm:w-56"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={DEFAULT}>Mặc định</SelectItem>
            {(setting.values ?? []).map((option) => (
              <SelectItem key={option} value={option}>{enumLabel(option)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    case 'integer':
      return (
        <Input
          id={id}
          type="number"
          className="w-32"
          min={setting.minValue ?? 1}
          max={setting.maxValue ?? 48}
          value={typeof value === 'number' ? value : ''}
          onChange={(event) => onChange(event.target.value === '' ? undefined : Number(event.target.value))}
          placeholder="Mặc định"
          disabled={readOnly}
        />
      )
    case 'source':
      return <ProductSourceSetting value={(value as { type: string }) ?? { type: 'NEWEST' }} onChange={onChange} readOnly={readOnly} />
    case 'talkSource':
      return <TalkSourceSetting value={(value as { type: string }) ?? { type: 'NEWEST' }} onChange={onChange} readOnly={readOnly} />
    case 'uuid':
      return <ReferencePicker kind="story" multiple={false} value={typeof value === 'string' ? [value] : []} onChange={(ids) => onChange(ids[0])} readOnly={readOnly} />
    case 'uuidArray':
      return (
        <Textarea
          id={id}
          rows={3}
          className="font-mono text-xs"
          value={Array.isArray(value) ? value.join('\n') : ''}
          onChange={(event) => onChange(event.target.value.split(/\s+/).filter(Boolean))}
          placeholder="Mỗi dòng một ID"
          disabled={readOnly}
        />
      )
    default:
      if (setting.key === 'productId')
        return <ReferencePicker kind="product" multiple={false} value={typeof value === 'string' && value ? [value] : []} onChange={(ids) => onChange(ids[0])} readOnly={readOnly} />
      if (LONG_TEXT.has(setting.key))
        return <Textarea id={id} rows={3} value={typeof value === 'string' ? value : ''} onChange={(event) => onChange(event.target.value)} disabled={readOnly} />
      return (
        <Input
          id={id}
          value={typeof value === 'string' ? value : ''}
          onChange={(event) => onChange(setting.required || event.target.value ? event.target.value : undefined)}
          placeholder={setting.kind === 'link' ? '/about hoặc https://…' : undefined}
          disabled={readOnly}
        />
      )
  }
}
