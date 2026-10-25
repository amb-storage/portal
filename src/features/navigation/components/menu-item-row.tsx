import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { SelectOption } from '@/components/form/select-field'
import { withForm } from '@/components/form/form-hook'
import { DESTINATION_HINTS } from '../menu-values'
import { DESTINATION_TYPES, type MenuFormValues } from '../types'

// MILI_TALK is the API's wire value for a Story destination.
const typeOptions = DESTINATION_TYPES.map((type) => ({ value: type, label: type === 'MILI_TALK' ? 'STORY' : type.replaceAll('_', ' ') }))
const required = ({ value }: { value: string }) => (value.trim() ? undefined : 'Required')

export const MenuItemRow = withForm({
  defaultValues: { items: [] } as MenuFormValues,
  props: {
    index: 0,
    count: 0,
    pageOptions: [] as SelectOption[],
    parentOptions: [] as SelectOption[],
    onMove: (() => undefined) as (from: number, to: number) => void,
    onRemove: (() => undefined) as (index: number) => void,
  },
  render: function Render({ form, index, count, pageOptions, parentOptions, onMove, onRemove }) {
    return (
      <div className="grid gap-3 rounded-md border p-3 md:grid-cols-[1fr_1fr_1fr_auto]">
        <form.AppField name={`items[${index}].labelJa`} validators={{ onSubmit: required }}>
          {(field) => <field.TextField label="Tên hiển thị (Nhật)" />}
        </form.AppField>
        <form.AppField name={`items[${index}].labelEn`} validators={{ onSubmit: required }}>
          {(field) => <field.TextField label="Tên hiển thị (Anh)" />}
        </form.AppField>
        <form.AppField name={`items[${index}].parentId`}>
          {(field) => <field.SelectField label="Mục cha" allowEmpty options={parentOptions} />}
        </form.AppField>
        <div className="flex items-end gap-1">
          <Button type="button" size="icon" variant="ghost" aria-label="Lên" disabled={index === 0} onClick={() => onMove(index, index - 1)}>
            <ArrowUp />
          </Button>
          <Button type="button" size="icon" variant="ghost" aria-label="Xuống" disabled={index === count - 1} onClick={() => onMove(index, index + 1)}>
            <ArrowDown />
          </Button>
          <Button type="button" size="icon" variant="ghost" aria-label="Xoá" onClick={() => onRemove(index)}>
            <Trash2 />
          </Button>
        </div>
        <form.AppField name={`items[${index}].destinationType`}>
          {(field) => <field.SelectField label="Loại liên kết" options={typeOptions} />}
        </form.AppField>
        <form.Subscribe selector={(state) => state.values.items[index]?.destinationType}>
          {(type) =>
            type === 'PAGE' ? (
              <form.AppField name={`items[${index}].pageId`} validators={{ onSubmit: required }}>
                {(field) => <field.SelectField label="Trang" options={pageOptions} />}
              </form.AppField>
            ) : (
              <form.AppField name={`items[${index}].destination`} validators={{ onSubmit: required }}>
                {(field) => <field.TextField label="Liên kết tới" description={DESTINATION_HINTS[type ?? 'PATH']} />}
              </form.AppField>
            )
          }
        </form.Subscribe>
        <div className="flex items-end pb-2">
          <form.AppField name={`items[${index}].enabled`}>{(field) => <field.SwitchField label="Hiển thị" />}</form.AppField>
        </div>
      </div>
    )
  },
})
