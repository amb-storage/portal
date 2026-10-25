import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { withForm } from '@/components/form/form-hook'
import { toFormValues } from '../form-values'

const EMPTY_DETAIL = { key: '', labelJa: '', labelEn: '', valueJa: '', valueEn: '' }

export const ProductDetailsFields = withForm({
  defaultValues: toFormValues(),
  render: function Render({ form }) {
    return (
      <form.AppField name="details" mode="array">
        {(details) => (
          <Card>
            <CardHeader>
              <CardTitle>Thông số</CardTitle>
              <CardDescription>Các dòng thông số (chất liệu, số đo…).</CardDescription>
              <CardAction>
                <Button type="button" variant="outline" size="sm" onClick={() => details.pushValue(EMPTY_DETAIL)}>
                  <Plus /> Thêm dòng
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent className="grid gap-4">
              {details.state.value.length === 0 ? (
                <p className="text-sm text-muted-foreground">Chưa có thông số.</p>
              ) : null}
              {details.state.value.map((_, index) => (
                <div key={index} className="grid items-end gap-2 rounded-md border p-3 md:grid-cols-[1fr_1fr_1fr_auto]">
                  <form.AppField name={`details[${index}].key`}>{(field) => <field.TextField label="Mã" />}</form.AppField>
                  <form.AppField name={`details[${index}].labelJa`}>{(field) => <field.TextField label="Nhãn (Nhật)" />}</form.AppField>
                  <form.AppField name={`details[${index}].labelEn`}>{(field) => <field.TextField label="Nhãn (Anh)" />}</form.AppField>
                  <Button type="button" variant="ghost" size="icon" aria-label="Xoá dòng" onClick={() => details.removeValue(index)}>
                    <Trash2 />
                  </Button>
                  <form.AppField name={`details[${index}].valueJa`}>{(field) => <field.TextField label="Giá trị (Nhật)" />}</form.AppField>
                  <form.AppField name={`details[${index}].valueEn`}>{(field) => <field.TextField label="Giá trị (Anh)" />}</form.AppField>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </form.AppField>
    )
  },
})
