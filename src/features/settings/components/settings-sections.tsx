import { statusLabel } from '@/lib/labels'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { withForm } from '@/components/form/form-hook'
import type { SettingsFormValues } from '../form-values'
import { TAX_DISPLAY_MODES } from '../types'

const defaults = {} as SettingsFormValues

/** taxCalculationMode changes the amount charged (API: 10% for Japanese deliveries). */
const TAX_CALCULATION_LABELS = {
  NONE: 'Không tính thuế: hoá đơn không ghi thuế',
  TAX_INCLUDED: 'Giá đã gồm thuế 10%: khách trả đúng giá, hoá đơn ghi phần thuế bên trong',
  TAX_EXCLUDED: 'Giá chưa gồm thuế: cộng thêm 10% khi thanh toán',
} as const

export const GeneralSection = withForm({
  defaultValues: defaults,
  render: function Render({ form }) {
    return (
      <Card>
        <CardHeader><CardTitle>Cửa hàng</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <form.AppField name="storeName">{(field) => <field.TextField label="Tên cửa hàng" />}</form.AppField>
          <form.AppField name="defaultCurrency">
            {(field) => <field.TextField label="Tiền tệ mặc định" maxLength={3} description="Mã ISO 4217, vd. JPY" />}
          </form.AppField>
          <form.AppField name="contactEmail">{(field) => <field.TextField label="Email liên hệ" type="email" />}</form.AppField>
          <form.AppField name="instagramUrl">{(field) => <field.TextField label="Instagram URL (cũ)" />}</form.AppField>
        </CardContent>
      </Card>
    )
  },
})

export const TaxFooterSection = withForm({
  defaultValues: defaults,
  render: function Render({ form }) {
    return (
      <Card>
        <CardHeader><CardTitle>Thuế & chân trang</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <form.AppField name="taxCalculationMode">
            {(field) => (
              <field.SelectField
                label="Cách tính thuế"
                description="Chỉ “Giá chưa gồm thuế” làm khách trả thêm. Áp dụng cho đơn mới giao trong Nhật; đơn đã tạo giữ nguyên."
                options={TAX_DISPLAY_MODES.map((mode) => ({ value: mode, label: TAX_CALCULATION_LABELS[mode] }))}
              />
            )}
          </form.AppField>
          <form.AppField name="taxDisplayMode">
            {(field) => (
              <field.SelectField
                label="Cách hiển thị thuế trên website"
                description="Chỉ là chữ hiển thị cạnh giá, không đổi số tiền."
                options={TAX_DISPLAY_MODES.map((mode) => ({ value: mode, label: statusLabel(mode) }))}
              />
            )}
          </form.AppField>
          <form.Subscribe selector={(state) => state.values.taxCalculationMode !== state.values.taxDisplayMode && state.values.taxCalculationMode !== 'NONE'}>
            {(mismatch) =>
              mismatch ? (
                <p className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 md:col-span-2 dark:border-amber-400/40 dark:bg-amber-400/10 dark:text-amber-200">
                  Cách hiển thị thuế đang khác cách tính thuế: khách có thể thấy chữ trên website không khớp số tiền thanh toán.
                </p>
              ) : null
            }
          </form.Subscribe>
          <form.AppField name="taxNoteJa">{(field) => <field.TextField label="Ghi chú thuế (Nhật)" />}</form.AppField>
          <form.AppField name="taxNoteEn">{(field) => <field.TextField label="Ghi chú thuế (Anh)" />}</form.AppField>
          <form.AppField name="footerTextJa">{(field) => <field.TextareaField label="Chữ chân trang (Nhật)" rows={2} />}</form.AppField>
          <form.AppField name="footerTextEn">{(field) => <field.TextareaField label="Chữ chân trang (Anh)" rows={2} />}</form.AppField>
        </CardContent>
      </Card>
    )
  },
})

export const SeoSection = withForm({
  defaultValues: defaults,
  render: function Render({ form }) {
    return (
      <Card>
        <CardHeader><CardTitle>SEO mặc định</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <form.AppField name="seoTitleJa">{(field) => <field.TextField label="Tiêu đề SEO (Nhật)" />}</form.AppField>
          <form.AppField name="seoTitleEn">{(field) => <field.TextField label="Tiêu đề SEO (Anh)" />}</form.AppField>
          <form.AppField name="seoDescriptionJa">{(field) => <field.TextareaField label="Mô tả SEO (Nhật)" rows={2} />}</form.AppField>
          <form.AppField name="seoDescriptionEn">{(field) => <field.TextareaField label="Mô tả SEO (Anh)" rows={2} />}</form.AppField>
        </CardContent>
      </Card>
    )
  },
})
