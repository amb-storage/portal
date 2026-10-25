import type { SelectOption } from '@/components/form/select-field'
import { withForm } from '@/components/form/form-hook'
import { DESTINATION_HINTS } from '../menu-values'
import { DESTINATION_TYPES, type MenuFormValues } from '../types'

// MILI_TALK is the API's wire value for a Story destination.
export const DESTINATION_LABELS: Record<string, string> = {
  PAGE: 'Trang',
  CATEGORY: 'Danh mục',
  PRODUCT: 'Sản phẩm',
  MILI_TALK: 'Bài viết',
  PATH: 'Đường dẫn',
  EXTERNAL_URL: 'Link ngoài',
}
const typeOptions = DESTINATION_TYPES.map((type) => ({ value: type, label: DESTINATION_LABELS[type] }))
const required = ({ value }: { value: string }) => (value.trim() ? undefined : 'Bắt buộc')

/** Edit fields of one menu item; hierarchy is changed from the tree row actions. */
export const MenuItemFields = withForm({
  defaultValues: { items: [] } as MenuFormValues,
  props: { index: 0, pageOptions: [] as SelectOption[] },
  render: function Render({ form, index, pageOptions }) {
    return (
      <div className="grid gap-3 md:grid-cols-2">
        <form.AppField name={`items[${index}].labelJa`} validators={{ onSubmit: required }}>
          {(field) => <field.TextField label="Tên hiển thị (Nhật)" />}
        </form.AppField>
        <form.AppField name={`items[${index}].labelEn`} validators={{ onSubmit: required }}>
          {(field) => <field.TextField label="Tên hiển thị (Anh)" />}
        </form.AppField>
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
        <form.AppField name={`items[${index}].enabled`}>{(field) => <field.SwitchField label="Hiển thị trên website" />}</form.AppField>
      </div>
    )
  },
})
