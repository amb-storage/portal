import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useProductStockTab } from '../hooks/use-product-stock-tab'
import type { Product } from '../types'

export function StockCard({ product, canManage }: { product: Product; canManage: boolean }) {
  const { form } = useProductStockTab(product.id)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tồn kho</CardTitle>
        <CardDescription>Đơn đã thanh toán tự trừ kho. Hoàn tiền không tự cộng lại.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <p className="text-4xl font-semibold tabular-nums">{product.quantity ?? '—'}</p>
        {canManage ? (
          <form
            className="grid gap-3"
            onSubmit={(event) => {
              event.preventDefault()
              void form.handleSubmit()
            }}
          >
            <form.AppField name="delta">
              {(field) => <field.NumberField label="Thêm / bớt" placeholder="vd. 3 hoặc -1" />}
            </form.AppField>
            <form.AppField name="reason">
              {(field) => <field.TextField label="Lý do" placeholder="Nhập thêm hàng, hàng lỗi…" />}
            </form.AppField>
            <form.AppForm>
              <form.SubmitButton>Cập nhật tồn kho</form.SubmitButton>
            </form.AppForm>
          </form>
        ) : null}
      </CardContent>
    </Card>
  )
}
