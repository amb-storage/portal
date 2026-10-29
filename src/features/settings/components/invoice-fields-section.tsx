import { ArrowDown, ArrowUp, Plus, Sparkles, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { withForm } from '@/components/form/form-hook'
import type { SettingsFormValues } from '../form-values'

/** Suggested rows for a Japanese qualified invoice (適格請求書); the shop edits or removes them. */
const SUGGESTED = [
  { labelJa: '発行者', labelEn: 'Issuer', valueJa: '', valueEn: '' },
  { labelJa: '登録番号', labelEn: 'Registration No.', valueJa: 'T', valueEn: '' },
  { labelJa: '住所', labelEn: 'Address', valueJa: '', valueEn: '' },
  { labelJa: '連絡先', labelEn: 'Contact', valueJa: '', valueEn: '' },
]

const emptyRow = () => ({ id: crypto.randomUUID(), labelJa: '', labelEn: '', valueJa: '', valueEn: '' })

export const InvoiceFieldsSection = withForm({
  defaultValues: {} as SettingsFormValues,
  props: { supported: true },
  render: function Render({ form, supported }) {
    return (
      <form.AppField name="invoiceFields" mode="array">
        {(rows) => (
          <Card id="invoice">
            <CardHeader>
              <CardTitle>Hoá đơn</CardTitle>
              <CardDescription>
                Các dòng cố định in trên mọi hoá đơn (Đơn hàng → Xuất hoá đơn), theo thứ tự bên dưới. Tự thêm bất kỳ dòng nào: số đăng ký, người phát hành, địa chỉ, tài khoản ngân hàng… Tiếng Anh để trống thì hoá đơn tiếng Anh dùng tiếng Nhật.
              </CardDescription>
              {supported ? (
                <CardAction className="flex gap-2">
                  {rows.state.value.length === 0 ? (
                    <Button type="button" variant="outline" size="sm" onClick={() => SUGGESTED.forEach((row) => rows.pushValue({ id: crypto.randomUUID(), ...row }))}>
                      <Sparkles /> Thêm trường mẫu
                    </Button>
                  ) : null}
                  <Button type="button" variant="outline" size="sm" disabled={rows.state.value.length >= 30} onClick={() => rows.pushValue(emptyRow())}>
                    <Plus /> Thêm dòng
                  </Button>
                </CardAction>
              ) : null}
            </CardHeader>
            <CardContent className="grid gap-3">
              {!supported ? (
                <p className="text-sm text-muted-foreground">API hiện tại chưa hỗ trợ trường hoá đơn. Cần cập nhật backend (migration 0037).</p>
              ) : rows.state.value.length === 0 ? (
                <p className="text-sm text-muted-foreground">Chưa có dòng nào. Bấm “Thêm trường mẫu” để bắt đầu nhanh.</p>
              ) : null}
              {rows.state.value.map((row, index) => (
                <div key={row.id} className="grid gap-2 rounded-lg border p-3">
                  <div className="flex items-center justify-between text-sm font-medium text-muted-foreground">
                    Dòng {index + 1}
                    <div className="flex gap-1">
                      <Button type="button" size="icon" variant="ghost" aria-label="Lên" disabled={index === 0} onClick={() => rows.moveValue(index, index - 1)}>
                        <ArrowUp />
                      </Button>
                      <Button type="button" size="icon" variant="ghost" aria-label="Xuống" disabled={index === rows.state.value.length - 1} onClick={() => rows.moveValue(index, index + 1)}>
                        <ArrowDown />
                      </Button>
                      <Button type="button" size="icon" variant="ghost" aria-label="Xoá dòng" onClick={() => rows.removeValue(index)}>
                        <Trash2 />
                      </Button>
                    </div>
                  </div>
                  <div className="grid gap-2 md:grid-cols-[180px_1fr] md:items-start">
                    <form.AppField name={`invoiceFields[${index}].labelJa`}>{(field) => <field.TextField label="Tên dòng (Nhật)" placeholder="登録番号" />}</form.AppField>
                    <form.AppField name={`invoiceFields[${index}].valueJa`}>{(field) => <field.TextareaField label="Nội dung (Nhật)" rows={2} />}</form.AppField>
                    <form.AppField name={`invoiceFields[${index}].labelEn`}>{(field) => <field.TextField label="Tên dòng (Anh)" placeholder="Registration No." />}</form.AppField>
                    <form.AppField name={`invoiceFields[${index}].valueEn`}>{(field) => <field.TextareaField label="Nội dung (Anh)" rows={2} description="Để trống nếu giống tiếng Nhật" />}</form.AppField>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </form.AppField>
    )
  },
})
