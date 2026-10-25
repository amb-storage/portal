import { CheckCircle2, Circle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

export interface PublishChecklistItem {
  key: string
  label: string
  done: boolean
}

interface PublishChecklistCardProps<T extends PublishChecklistItem> {
  items: T[]
  /** Jump to where the missing item is fixed. */
  onGo: (item: T) => void
  readyTitle?: string
  pendingTitle?: string
}

/** Pre-publish requirements, mirrored client-side because publish errors don't list the failing rules. */
export function PublishChecklistCard<T extends PublishChecklistItem>({
  items,
  onGo,
  readyTitle = 'Sẵn sàng đăng bán',
  pendingTitle = 'Cần hoàn thành để đăng bán',
}: PublishChecklistCardProps<T>) {
  const done = items.filter((item) => item.done).length
  const complete = done === items.length

  return (
    <Card>
      <CardHeader>
        <CardTitle>{complete ? readyTitle : pendingTitle}</CardTitle>
        <CardDescription>
          {done}/{items.length} mục · tính theo dữ liệu đã lưu
        </CardDescription>
        <Progress value={(done / items.length) * 100} className="mt-2" />
      </CardHeader>
      <CardContent>
        <ul className="grid gap-1 text-sm">
          {items.map((item) => (
            <li key={item.key}>
              <button
                type="button"
                disabled={item.done}
                onClick={() => onGo(item)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1 text-left enabled:hover:bg-muted disabled:cursor-default"
              >
                {item.done ? (
                  <CheckCircle2 className="size-4 shrink-0 text-primary" />
                ) : (
                  <Circle className="size-4 shrink-0 text-muted-foreground" />
                )}
                <span className={item.done ? 'text-muted-foreground line-through' : ''}>{item.label}</span>
                {item.done ? null : <span className="ml-auto text-xs text-primary">Bổ sung →</span>}
              </button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
