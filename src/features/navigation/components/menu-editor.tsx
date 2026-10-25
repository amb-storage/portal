import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDateTime } from '@/lib/format'
import { useMenuEditor } from '../hooks/use-menu-editor'
import { newMenuItem } from '../menu-values'
import type { NavigationMenu } from '../types'
import { MenuItemRow } from './menu-item-row'

/** Key by `${key}:${revision}` so the form resets after save/reload. */
export function MenuEditor({ menu, canManage }: { menu: NavigationMenu; canManage: boolean }) {
  const { form, pageOptions } = useMenuEditor(menu)

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      <form.AppField name="items" mode="array">
        {(items) => (
          <Card>
            <CardHeader>
              <CardTitle>{menu.key} menu</CardTitle>
              <CardDescription>
                Revision {menu.revision} · updated {formatDateTime(menu.updatedAt)}. Order = position among siblings.
              </CardDescription>
              {canManage ? (
                <CardAction>
                  <Button type="button" variant="outline" size="sm" onClick={() => items.pushValue(newMenuItem())}>
                    <Plus /> Thêm mục
                  </Button>
                </CardAction>
              ) : null}
            </CardHeader>
            <CardContent>
              <fieldset disabled={!canManage} className="grid gap-3">
                {items.state.value.length === 0 ? <p className="text-sm text-muted-foreground">Chưa có mục nào.</p> : null}
                {items.state.value.map((item, index) => (
                  <MenuItemRow
                    key={item.id}
                    form={form}
                    index={index}
                    count={items.state.value.length}
                    pageOptions={pageOptions}
                    parentOptions={items.state.value
                      .filter((other) => other.id !== item.id)
                      .map((other) => ({ value: other.id, label: other.labelEn || other.labelJa || other.id.slice(0, 8) }))}
                    onMove={items.moveValue}
                    onRemove={items.removeValue}
                  />
                ))}
              </fieldset>
              {canManage ? (
                <div className="mt-4 flex justify-end">
                  <form.AppForm>
                    <form.SubmitButton requireDirty>Lưu menu</form.SubmitButton>
                  </form.AppForm>
                </div>
              ) : null}
            </CardContent>
          </Card>
        )}
      </form.AppField>
    </form>
  )
}
