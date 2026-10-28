import type { OrderSummary } from '@/features/orders/types'
import type { DateRange } from './types'

export interface DailyRevenue {
  /** UTC calendar day, YYYY-MM-DD (the financial dashboard API counts days in UTC too). */
  day: string
  amount: number
  /** Tax included in `amount` (Order tax snapshot), not added on top. */
  tax: number
  orders: number
}

/** Buckets paid orders into each UTC day of the range (oldest first, empty days included). */
export function dailyRevenue(orders: OrderSummary[], range: DateRange): DailyRevenue[] {
  const days: DailyRevenue[] = []
  for (let date = new Date(`${range.from}T00:00:00Z`); date.toISOString().slice(0, 10) <= range.to; date.setUTCDate(date.getUTCDate() + 1))
    days.push({ day: date.toISOString().slice(0, 10), amount: 0, tax: 0, orders: 0 })
  const byDay = new Map(days.map((entry) => [entry.day, entry]))
  for (const order of orders) {
    if (!order.paid_at) continue
    const bucket = byDay.get(new Date(order.paid_at).toISOString().slice(0, 10))
    if (!bucket) continue
    bucket.amount += order.total_amount
    bucket.tax += order.tax_amount
    bucket.orders += 1
  }
  return days
}
