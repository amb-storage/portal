/** GET /admin/orders/financial-dashboard: integer JPY amounts for orders paid in the range. */
export interface FinancialDashboard {
  from: string
  to: string
  currency: string
  paidOrders: number
  grossRevenue: number
  taxCollected: number
  /** grossRevenue − taxCollected − refunds */
  netSales: number
  refunds: number
}

export type AnalyticsStatus = 'ok' | 'not_configured' | 'unauthorized' | 'forbidden' | 'rate_limited' | 'unavailable'
export const ANALYTICS_EVENTS = ['view_product', 'add_to_cart', 'begin_checkout'] as const

export interface Breakdown {
  name: string
  visitors: number
}

/** GET /admin/analytics: GoatCounter visitor counts (not unique people, not pageviews). */
export interface AnalyticsData {
  provider: 'goatcounter'
  from: string
  to: string
  metrics: { visitors: number; eventVisitors: number }
  traffic: Array<{ day: string; visitors: number }>
  topPages: Array<{ path: string; title: string | null; visitors: number }>
  referrers: Breakdown[]
  devices: { browsers: Breakdown[]; systems: Breakdown[]; locations: Breakdown[] }
  events: Array<{ name: (typeof ANALYTICS_EVENTS)[number]; count: number }>
}

export interface AnalyticsEnvelope {
  status: AnalyticsStatus
  /** Provider failed; this is the last cached data for the range. */
  stale: boolean
  message?: string
  data: AnalyticsData | null
}

export const RANGE_PRESETS = [7, 30, 90] as const
export type RangeDays = (typeof RANGE_PRESETS)[number]

export interface DateRange {
  from: string
  to: string
}

const utcDay = (date: Date) => date.toISOString().slice(0, 10)

/** Last `days` UTC calendar days including today, as both APIs interpret `from`/`to`. */
export function lastDays(days: number, today = new Date()): DateRange {
  const to = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()))
  const from = new Date(to)
  from.setUTCDate(from.getUTCDate() - (days - 1))
  return { from: utcDay(from), to: utcDay(to) }
}
