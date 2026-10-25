import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { withForm } from '@/components/form/form-hook'
import { toFormValues } from '../form-values'

export const ProductSeoFields = withForm({
  defaultValues: toFormValues(),
  render: function Render({ form }) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>SEO (tuỳ chọn)</CardTitle>
          <CardDescription>Để trống thì dùng tên và mô tả sản phẩm.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <form.AppField name="seoTitleJa">{(field) => <field.TextField label="Tiêu đề SEO (Nhật)" />}</form.AppField>
          <form.AppField name="seoTitleEn">{(field) => <field.TextField label="Tiêu đề SEO (Anh)" />}</form.AppField>
          <form.AppField name="seoDescriptionJa">
            {(field) => <field.TextareaField label="Mô tả SEO (Nhật)" rows={3} />}
          </form.AppField>
          <form.AppField name="seoDescriptionEn">
            {(field) => <field.TextareaField label="Mô tả SEO (Anh)" rows={3} />}
          </form.AppField>
        </CardContent>
      </Card>
    )
  },
})
