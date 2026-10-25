import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { statusLabel } from '@/lib/labels'
import { allowedFulfillment } from '../fulfillment'
import { useFulfillmentForm } from '../hooks/use-fulfillment-form'
import type { Order } from '../types'

export function FulfillmentCard({ order, canManage }: { order: Order; canManage: boolean }) {
  const form = useFulfillmentForm(order)
  const options = allowedFulfillment(order).map((status) => ({ value: status, label: statusLabel(status) }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Giao hàng</CardTitle>
        <CardDescription>Chỉ đơn đã thanh toán mới chuyển được: Chờ giao → Đã gửi → Đã giao.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault()
            void form.handleSubmit()
          }}
        >
          <fieldset disabled={!canManage} className="grid gap-4 md:grid-cols-3">
            <form.AppField name="fulfillmentStatus">
              {(field) => <field.SelectField label="Trạng thái giao" options={options} disabled={!canManage || options.length < 2} />}
            </form.AppField>
            <form.AppField name="carrier">{(field) => <field.TextField label="Đơn vị vận chuyển" />}</form.AppField>
            <form.AppField name="trackingNumber">{(field) => <field.TextField label="Mã vận đơn" />}</form.AppField>
            <div className="md:col-span-3">
              <form.AppField name="internalNote">
                {(field) => <field.TextareaField label="Ghi chú nội bộ" rows={3} description="Khách hàng không nhìn thấy." />}
              </form.AppField>
            </div>
          </fieldset>
          {canManage ? (
            <div className="flex justify-end">
              <form.AppForm>
                <form.SubmitButton>Lưu thông tin giao hàng</form.SubmitButton>
              </form.AppForm>
            </div>
          ) : null}
        </form>
      </CardContent>
    </Card>
  )
}
