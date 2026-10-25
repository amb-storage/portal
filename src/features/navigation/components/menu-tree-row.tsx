import type { ReactNode } from 'react'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, ChevronRight, CornerDownRight, Plus, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { MAX_MENU_DEPTH, isIncomplete, type TreeRow } from '../menu-tree'
import { DESTINATION_LABELS } from './menu-item-row'

interface MenuTreeRowProps {
  row: TreeRow
  pageLabel?: string
  open: boolean
  readOnly: boolean
  canIndent: boolean
  onToggle: () => void
  onMove: (delta: -1 | 1) => void
  onIndent: () => void
  onOutdent: () => void
  onAddChild: () => void
  onRemove: () => void
  children: ReactNode
}

/** One item of the menu tree: summary line, actions, and its edit form when open. */
export function MenuTreeRow({ row, pageLabel, open, readOnly, canIndent, onToggle, onMove, onIndent, onOutdent, onAddChild, onRemove, children }: MenuTreeRowProps) {
  const { item, depth } = row
  const target = item.destinationType === 'PAGE' ? pageLabel ?? 'chưa chọn trang' : item.destination || '—'

  return (
    <li style={{ marginLeft: (depth - 1) * 28 }} className={cn('relative', depth > 1 && 'before:absolute before:top-0 before:-left-4 before:h-6 before:w-3 before:rounded-bl-md before:border-b-2 before:border-l-2 before:border-border')}>
      <div className={cn('rounded-lg border bg-card', open && 'ring-2 ring-primary/30', !item.enabled && 'opacity-60')}>
        <div className="flex flex-wrap items-center gap-2 px-3 py-2">
          <button type="button" onClick={onToggle} className="flex min-w-0 flex-1 items-center gap-2 text-left" aria-expanded={open}>
            <ChevronRight className={cn('size-4 shrink-0 text-muted-foreground transition', open && 'rotate-90')} />
            {depth > 1 ? <CornerDownRight className="size-3.5 shrink-0 text-muted-foreground" /> : null}
            <span className="truncate font-medium">{item.labelJa || item.labelEn || 'Mục mới'}</span>
            {item.labelEn && item.labelJa ? <span className="truncate text-sm text-muted-foreground">/ {item.labelEn}</span> : null}
            <Badge variant="outline" className="shrink-0">{DESTINATION_LABELS[item.destinationType]}</Badge>
            <code className="hidden truncate text-xs text-muted-foreground sm:inline">{target}</code>
            {row.childCount ? <span className="shrink-0 text-xs text-muted-foreground">{row.childCount} mục con</span> : null}
            {!item.enabled ? <Badge variant="secondary" className="shrink-0">Đang ẩn</Badge> : null}
            {isIncomplete(item) ? <Badge variant="destructive" className="shrink-0">Thiếu thông tin</Badge> : null}
          </button>
          {readOnly ? null : (
            <div className="flex shrink-0 items-center">
              <Action label="Lên trên" disabled={row.siblingIndex === 0} onClick={() => onMove(-1)}><ArrowUp /></Action>
              <Action label="Xuống dưới" disabled={row.siblingIndex === row.siblingCount - 1} onClick={() => onMove(1)}><ArrowDown /></Action>
              <Action label="Đưa ra ngoài một cấp" disabled={depth === 1} onClick={onOutdent}><ArrowLeft /></Action>
              <Action label="Thành mục con của mục phía trên" disabled={!canIndent} onClick={onIndent}><ArrowRight /></Action>
              <Action label="Thêm mục con" disabled={depth >= MAX_MENU_DEPTH} onClick={onAddChild}><Plus /></Action>
              <Action label={row.childCount ? 'Xoá cả mục con' : 'Xoá'} onClick={onRemove}><Trash2 /></Action>
            </div>
          )}
        </div>
        {open ? <div className="border-t p-3">{children}</div> : null}
      </div>
    </li>
  )
}

function Action({ label, disabled, onClick, children }: { label: string; disabled?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <Button type="button" size="icon" variant="ghost" className="size-8" title={label} aria-label={label} disabled={disabled} onClick={onClick}>
      {children}
    </Button>
  )
}
