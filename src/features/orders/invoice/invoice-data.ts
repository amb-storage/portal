import type { InvoiceField } from '@/features/settings/types'
import type { Order, OrderItem } from '../types'

export type InvoiceLang = 'ja' | 'en'
export type InvoiceKind = 'receipt' | 'invoice'

/** One-off values typed while printing; never stored (ADMIN_API_MAPPING "Invoices"). */
export interface InvoiceOptions {
  kind: InvoiceKind
  lang: InvoiceLang
  number: string
  /** yyyy-mm-dd */
  issueDate: string
  addressee: string
  /** 但し書き, e.g. "お品代として" */
  purpose: string
  extraRows: Array<{ id: string; label: string; value: string }>
}

export const TEXT = {
  ja: {
    receipt: '領収書',
    invoice: '請求書',
    number: 'No.',
    issueDate: '発行日',
    orderDate: 'ご注文日',
    honorific: '様',
    total: '合計金額（税込）',
    purposePrefix: '但し',
    purposeSuffix: '',
    received: '上記正に領収いたしました。',
    item: '品名',
    qty: '数量',
    unit: '単価',
    amount: '金額',
    subtotal: '小計',
    shipping: '送料',
    taxBase: (rate: number) => `${rate}%対象`,
    taxIncluded: (tax: string) => `（内消費税 ${tax}）`,
    taxExcluded: (tax: string) => `消費税 ${tax}`,
    noTax: '消費税なし',
    grandTotal: '合計',
  },
  en: {
    receipt: 'Receipt',
    invoice: 'Invoice',
    number: 'No.',
    issueDate: 'Issue date',
    orderDate: 'Order date',
    honorific: '',
    total: 'Total (tax included)',
    purposePrefix: 'For',
    purposeSuffix: '',
    received: 'Received with thanks.',
    item: 'Item',
    qty: 'Qty',
    unit: 'Unit price',
    amount: 'Amount',
    subtotal: 'Subtotal',
    shipping: 'Shipping',
    taxBase: (rate: number) => `${rate}% items`,
    taxIncluded: (tax: string) => `(incl. consumption tax ${tax})`,
    taxExcluded: (tax: string) => `Consumption tax ${tax}`,
    noTax: 'No consumption tax',
    grandTotal: 'Total',
  },
} as const

const yen = new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' })
/** JPY is zero-decimal; other currencies fall back to their own formatting. */
export function money(amount: number, currency: string) {
  if (currency === 'JPY') return yen.format(amount)
  try {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency }).format(amount / 100)
  } catch {
    return `${amount} ${currency}`
  }
}

/** Customer name from the delivery snapshot (checkout form, else Stripe), else the email. */
export function defaultAddressee(order: Order): string {
  const snapshot = (order.shipping_snapshot ?? {}) as {
    recipientName?: string
    stripe?: { customerDetails?: { name?: string | null } | null } | null
    customerDetails?: { name?: string | null } | null
  }
  return snapshot.recipientName || snapshot.stripe?.customerDetails?.name || snapshot.customerDetails?.name || order.email
}

export const pick = (lang: InvoiceLang, ja: string, en: string) => (lang === 'en' && en.trim() ? en : ja)

export function fixedRows(fields: InvoiceField[], lang: InvoiceLang) {
  return fields.map((field) => ({ id: field.id, label: pick(lang, field.labelJa, field.labelEn), value: pick(lang, field.valueJa, field.valueEn) }))
}

export const lineName = (item: OrderItem) => item.product_name ?? item.product_slug ?? item.product_id
