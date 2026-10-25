import { ArrowDown, ArrowUp, ImagePlus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MediaThumb } from '@/components/common/media-thumb'
import { StatusBadge } from '@/components/common/status-badge'
import { useProductMediaTab } from '../hooks/use-product-media-tab'
import type { Product } from '../types'
import { MediaPickerDialog } from './media-picker-dialog'

export function MediaTab({ product, canManage }: { product: Product; canManage: boolean }) {
  const { slots, dirty, move, remove, add, save, reset, pickerOpen, setPickerOpen } = useProductMediaTab(product)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ảnh sản phẩm</CardTitle>
        <CardDescription>Ảnh đầu tiên là ảnh chính. Cần ít nhất một ảnh READY để đăng bán.</CardDescription>
        {canManage ? (
          <CardAction>
            <Button variant="outline" size="sm" onClick={() => setPickerOpen(true)}>
              <ImagePlus /> Chọn ảnh
            </Button>
          </CardAction>
        ) : null}
      </CardHeader>
      <CardContent className="grid gap-3">
        <ol className="grid gap-2">
          {slots.map((slot, index) => (
            <li key={slot.id} className="flex items-center gap-3 rounded-md border px-3 py-2 text-sm">
              <MediaThumb id={slot.id} status={slot.status} className="size-14 shrink-0" />
              <span className="grid flex-1 gap-0.5 truncate">
                <span className="truncate">{slot.label}</span>
                {index === 0 ? <span className="text-xs font-medium text-primary">Ảnh chính</span> : null}
              </span>
              <span className="text-xs text-muted-foreground">{slot.mimeType}</span>
              <StatusBadge status={slot.status} />
              {canManage ? (
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" aria-label="Lên" disabled={index === 0} onClick={() => move(index, -1)}>
                    <ArrowUp />
                  </Button>
                  <Button size="icon" variant="ghost" aria-label="Xuống" disabled={index === slots.length - 1} onClick={() => move(index, 1)}>
                    <ArrowDown />
                  </Button>
                  <Button size="icon" variant="ghost" aria-label="Gỡ" onClick={() => remove(slot.id)}>
                    <Trash2 />
                  </Button>
                </div>
              ) : null}
            </li>
          ))}
          {slots.length === 0 ? <li className="text-sm text-muted-foreground">Chưa có ảnh.</li> : null}
        </ol>
        {canManage ? (
          <div className="flex justify-end gap-2">
            <Button variant="outline" disabled={!dirty} onClick={reset}>Hoàn tác</Button>
            <Button disabled={!dirty || save.isPending} onClick={() => save.mutate()}>Lưu ảnh</Button>
          </div>
        ) : null}
      </CardContent>
      <MediaPickerDialog open={pickerOpen} onOpenChange={setPickerOpen} excludeIds={slots.map((slot) => slot.id)} onPick={add} />
    </Card>
  )
}
