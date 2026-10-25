import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDateTime } from '@/lib/format'
import { useMenuEditor } from '../hooks/use-menu-editor'
import { newMenuItem } from '../menu-values'
import { MAX_MENU_DEPTH, buildTree, canIndent, indent, isIncomplete, moveAmongSiblings, outdent, removeWithChildren } from '../menu-tree'
import type { MenuItemValues, NavigationMenu } from '../types'
import { MenuItemFields } from './menu-item-row'
import { MenuTreeRow } from './menu-tree-row'

const MENU_TITLES = { HEADER: 'Menu đầu trang', FOOTER: 'Menu chân trang' } as const

/** Key by `${key}:${revision}` so the form resets after save/reload. */
export function MenuEditor({ menu, canManage }: { menu: NavigationMenu; canManage: boolean }) {
  const { form, pageOptions } = useMenuEditor(menu)
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set())
  const pageLabels = new Map(pageOptions.map((option) => [option.value, option.label]))

  const toggle = (id: string, force?: boolean) =>
    setOpenIds((current) => {
      const next = new Set(current)
      if (force ?? !next.has(id)) next.add(id)
      else next.delete(id)
      return next
    })

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        // Open incomplete items so their validation messages are visible.
        form.state.values.items.filter(isIncomplete).forEach((item) => toggle(item.id, true))
        void form.handleSubmit()
      }}
    >
      <form.Subscribe selector={(state) => state.values.items}>
        {(items) => {
          const setItems = (next: MenuItemValues[]) => form.setFieldValue('items', next)
          const add = (parentId = '') => {
            const item = { ...newMenuItem(), parentId }
            setItems([...items, item])
            toggle(item.id, true)
            if (parentId) toggle(parentId, false)
          }
          const rows = buildTree(items)
          return (
            <Card>
              <CardHeader>
                <CardTitle>{MENU_TITLES[menu.key]}</CardTitle>
                <CardDescription>
                  Tối đa {MAX_MENU_DEPTH} cấp. Dùng → để đưa một mục vào làm mục con của mục ngay trên, ← để đưa ra ngoài. Cập nhật lần cuối {formatDateTime(menu.updatedAt)}.
                </CardDescription>
                {canManage ? (
                  <CardAction>
                    <Button type="button" variant="outline" size="sm" onClick={() => add()}>
                      <Plus /> Thêm mục
                    </Button>
                  </CardAction>
                ) : null}
              </CardHeader>
              <CardContent>
                <fieldset disabled={!canManage}>
                  {rows.length === 0 ? <p className="text-sm text-muted-foreground">Chưa có mục nào.</p> : null}
                  <ul className="grid gap-2 pl-4">
                    {rows.map((row) => (
                      <MenuTreeRow
                        key={row.item.id}
                        row={row}
                        pageLabel={pageLabels.get(row.item.pageId)}
                        open={openIds.has(row.item.id)}
                        readOnly={!canManage}
                        canIndent={canIndent(row, items)}
                        onToggle={() => toggle(row.item.id)}
                        onMove={(delta) => setItems(moveAmongSiblings(items, row.index, delta))}
                        onIndent={() => setItems(indent(items, row.index, row.depth))}
                        onOutdent={() => setItems(outdent(items, row.index))}
                        onAddChild={() => add(row.item.id)}
                        onRemove={() => {
                          if (row.childCount && !window.confirm(`Xoá "${row.item.labelJa || row.item.labelEn || 'mục này'}" cùng ${row.childCount} mục con?`)) return
                          setItems(removeWithChildren(items, row.index))
                        }}
                      >
                        <MenuItemFields form={form} index={row.index} pageOptions={pageOptions} />
                      </MenuTreeRow>
                    ))}
                  </ul>
                </fieldset>
              </CardContent>
            </Card>
          )
        }}
      </form.Subscribe>
      {canManage ? (
        <form.AppForm>
          <form.StickySaveBar>
            <form.SubmitButton requireDirty>Lưu menu</form.SubmitButton>
          </form.StickySaveBar>
        </form.AppForm>
      ) : null}
    </form>
  )
}
