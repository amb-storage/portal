import type { OrderSummary } from '@/features/orders/types'

export const REVENUE_DAYS = 30

export interface DailyRevenue {
  /** Local calendar day, YYYY-MM-DD. */
  day: string
  date: Date
  amount: number
  orders: number
}

const dayKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

/** Buckets paid orders into the last REVENUE_DAYS local days (oldest first, empty days included). */
export function dailyRevenue(orders: OrderSummary[], today = new Date()): DailyRevenue[] {
  const days: DailyRevenue[] = []
  for (let offset = REVENUE_DAYS - 1; offset >= 0; offset -= 1) {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - offset)
    days.push({ day: dayKey(date), date, amount: 0, orders: 0 })
  }
  const byDay = new Map(days.map((entry) => [entry.day, entry]))
  for (const order of orders) {
    if (!order.paid_at) continue
    const bucket = byDay.get(dayKey(new Date(order.paid_at)))
    if (!bucket) continue
    bucket.amount += order.total_amount
    bucket.orders += 1
  }
  return days
}
