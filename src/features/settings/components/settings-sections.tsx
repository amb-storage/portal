import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { withForm } from '@/components/form/form-hook'
import type { SettingsFormValues } from '../form-values'

const defaults = {} as SettingsFormValues

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
          <div className="grid gap-1.5 md:col-span-2">
            <form.AppField name="taxIncluded">{(field) => <field.SwitchField label="Giá đã gồm thuế tiêu dùng 10%" />}</form.AppField>
            <p className="text-sm text-muted-foreground">
              Bật: khách trả đúng giá niêm yết, hoá đơn ghi phần thuế 10% nằm trong giá (vd. ¥95,700 gồm ¥8,700 thuế) và website ghi “税込”.
              Tắt: không ghi thuế. Chỉ áp dụng cho đơn mới; đơn đã tạo giữ nguyên.
            </p>
          </div>
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
