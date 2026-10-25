import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfirmButton } from '@/components/common/confirm-button'
import { columnHelper } from '@/components/data-table/columns'
import type { Category } from '../types'

const helper = columnHelper<Category>()

interface ColumnActions {
  canManage: boolean
  onEdit: (category: Category) => void
  onDelete: (id: string) => void
}

export function buildCategoryColumns(actions: ColumnActions) {
  return helper.columns([
    helper.accessor('name_en', {
      header: 'Danh mục',
      cell: ({ row }) => (
        <span className="grid gap-0.5">
          <span className="font-medium">{row.original.name_en}</span>
          <span className="text-xs text-muted-foreground">{row.original.name_ja}</span>
        </span>
      ),
    }),
    helper.accessor('slug', { header: 'Slug', cell: (info) => <code className="text-xs">{info.getValue()}</code> }),
    helper.accessor('position', { header: 'Thứ tự' }),
    helper.display({
      id: 'actions',
      cell: ({ row }) =>
        actions.canManage ? (
          <div className="flex justify-end gap-1">
            <Button size="icon" variant="ghost" aria-label="Sửa" onClick={() => actions.onEdit(row.original)}>
              <Pencil />
            </Button>
            <ConfirmButton
              size="icon"
              variant="ghost"
              aria-label="Xoá"
              title={`Xoá danh mục "${row.original.name_en}"?`}
              description="Không xoá được nếu đây là danh mục duy nhất của một sản phẩm đang bán."
              confirmLabel="Xoá"
              onConfirm={() => actions.onDelete(row.original.id)}
            >
              <Trash2 />
            </ConfirmButton>
          </div>
        ) : null,
    }),
  ])
}
