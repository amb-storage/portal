const dateTime = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' })

export function formatDateTime(value: string | null | undefined) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : dateTime.format(date)
}

export function formatBytes(value: number | null | undefined) {
  if (value === null || value === undefined) return '—'
  const units = ['B', 'KB', 'MB', 'GB']
  let size = value
  let unit = 0
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024
    unit += 1
  }
  return `${size.toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`
}

/** Amounts are in the currency's minor unit (JPY has none). */
export function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency }).format(
      amount / 10 ** minorUnits(currency),
    )
  } catch {
    return `${amount} ${currency}`
  }
}

function minorUnits(currency: string) {
  return new Intl.NumberFormat('en', { style: 'currency', currency }).resolvedOptions().maximumFractionDigits ?? 2
}

export function shortId(id: string) {
  return id.slice(0, 8)
}

/** Converts '' to undefined so optional DTO fields are omitted. */
export function emptyToUndefined(value: string | null | undefined) {
  return value === null || value === undefined || value.trim() === '' ? undefined : value
}

/** Converts '' to null so nullable DTO fields can be cleared on update. */
export function emptyToNull(value: string | null | undefined) {
  return value === null || value === undefined || value.trim() === '' ? null : value
}
