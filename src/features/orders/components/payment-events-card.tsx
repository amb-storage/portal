import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDateTime } from '@/lib/format'
import type { PaymentEvent } from '../types'

export function PaymentEventsCard({ events }: { events: PaymentEvent[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lịch sử thanh toán</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="divide-y rounded-md border text-sm">
          {events.map((event) => (
            <li key={event.eventId} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
              <span>
                <span className="font-medium">{event.type}</span>{' '}
                <code className="text-xs text-muted-foreground">{event.eventId}</code>
              </span>
              <span className="text-muted-foreground">{formatDateTime(event.processedAt)}</span>
            </li>
          ))}
          {events.length === 0 ? <li className="px-3 py-2 text-muted-foreground">Chưa có sự kiện thanh toán nào từ Stripe.</li> : null}
        </ul>
      </CardContent>
    </Card>
  )
}
