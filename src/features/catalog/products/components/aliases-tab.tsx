import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useProductAliasesTab } from '../hooks/use-product-aliases-tab'

export function AliasesTab({ productId, canManage }: { productId: string; canManage: boolean }) {
  const { form, added } = useProductAliasesTab(productId)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Slug phụ (alias)</CardTitle>
        <CardDescription>Giữ cho các đường dẫn cũ vẫn trỏ về sản phẩm này. Slug đã bị dùng sẽ bị từ chối.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {canManage ? (
          <form
            className="flex items-start gap-2"
            onSubmit={(event) => {
              event.preventDefault()
              void form.handleSubmit()
            }}
          >
            <div className="flex-1">
              <form.AppField name="slug">{(field) => <field.TextField placeholder="historic-flight-jacket" />}</form.AppField>
            </div>
            <form.AppForm>
              <form.SubmitButton>Thêm alias</form.SubmitButton>
            </form.AppForm>
          </form>
        ) : (
          <p className="text-sm text-muted-foreground">Bạn cần quyền catalog.manage để thêm alias.</p>
        )}
        {added ? (
          <p className="text-sm">
            Vừa thêm: <code>{added.slug}</code>
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}
