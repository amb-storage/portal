import type { InvoiceField } from '@/features/settings/types'
import type { Order, OrderItem } from '../types'
import { fixedRows, lineName, money, TEXT, type InvoiceOptions } from './invoice-data'

interface InvoiceSheetProps {
  order: Order
  items: OrderItem[]
  storeName: string | null
  contactPhone?: string | null
  fields: InvoiceField[]
  options: InvoiceOptions
}

const dateText = (iso: string | null, lang: 'ja' | 'en') =>
  iso ? new Intl.DateTimeFormat(lang === 'ja' ? 'ja-JP' : 'en-GB', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(iso)) : '—'

/**
 * Printable A4 invoice/receipt. Amounts come from the Order's tax snapshot: with tax included the
 * tax is shown as part of the total (内消費税), never added on top.
 */
export function InvoiceSheet({ order, items, storeName, contactPhone, fields, options }: InvoiceSheetProps) {
  const t = TEXT[options.lang]
  const m = (amount: number) => money(amount, order.currency)
  const rate = order.tax_rate_percent ?? 0
  const mode = order.tax_calculation_mode ?? 'NONE'
  const taxed = mode !== 'NONE' && rate > 0
  const rows = [...fixedRows(fields, options.lang), ...options.extraRows.filter((row) => row.label.trim() || row.value.trim())]

  return (
    <article className="invoice-sheet mx-auto grid w-full max-w-[210mm] gap-8 bg-white p-10 text-[13px] leading-6 text-black shadow-sm print:max-w-none print:p-0 print:shadow-none">
      <header className="flex items-start justify-between gap-6">
        <h1 className="text-3xl font-bold tracking-[0.3em]">{options.kind === 'receipt' ? t.receipt : t.invoice}</h1>
        <dl className="grid grid-cols-[auto_auto] gap-x-3 text-right text-xs">
          <dt className="text-neutral-500">{t.number}</dt>
          <dd>{options.number}</dd>
          <dt className="text-neutral-500">{t.issueDate}</dt>
          <dd>{dateText(options.issueDate ? `${options.issueDate}T00:00:00` : null, options.lang)}</dd>
          <dt className="text-neutral-500">{t.orderDate}</dt>
          <dd>{dateText(order.paid_at ?? order.created_at, options.lang)}</dd>
        </dl>
      </header>

      <section className="grid gap-6 sm:grid-cols-2 print:grid-cols-2">
        <div className="grid content-start gap-4">
          <p className="border-b border-black pb-1 text-lg">
            {options.addressee}
            {t.honorific ? <span className="ml-3">{t.honorific}</span> : null}
          </p>
          <div className="grid gap-1 border-2 border-black p-3">
            <span className="text-xs">{t.total}</span>
            <span className="text-2xl font-bold tabular-nums">{m(order.total_amount)}</span>
            {taxed && mode === 'TAX_INCLUDED' ? <span className="text-xs">{t.taxIncluded(m(order.tax_amount))}</span> : null}
          </div>
          {options.purpose.trim() ? (
            <p>
              {t.purposePrefix} {options.purpose}
              {t.purposeSuffix}
            </p>
          ) : null}
          {options.kind === 'receipt' ? <p className="text-xs">{t.received}</p> : null}
        </div>
        <div className="grid content-start gap-1 text-xs sm:text-right print:text-right">
          {storeName ? <p className="text-sm font-semibold">{storeName}</p> : null}
          {contactPhone ? (
            <p>
              <span className="text-neutral-500">TEL：</span>
              {contactPhone}
            </p>
          ) : null}
          {rows.map((row) => (
            <p key={row.id} className="whitespace-pre-line">
              {row.label ? <span className="text-neutral-500">{row.label}：</span> : null}
              {row.value}
            </p>
          ))}
        </div>
      </section>

      <table className="w-full border-collapse">
        <thead>
          <tr className="border-y border-black text-left text-xs">
            <th className="py-2 font-medium">{t.item}</th>
            <th className="py-2 text-right font-medium">{t.qty}</th>
            <th className="py-2 text-right font-medium">{t.unit}</th>
            <th className="py-2 text-right font-medium">{t.amount}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.product_id} className="border-b border-neutral-300">
              <td className="py-2 pr-4">{lineName(item)}</td>
              <td className="py-2 text-right tabular-nums">{item.quantity}</td>
              <td className="py-2 text-right tabular-nums">{m(item.unit_price)}</td>
              <td className="py-2 text-right tabular-nums">{m(item.line_total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <dl className="ml-auto grid w-full max-w-xs grid-cols-[1fr_auto] gap-x-6 gap-y-1 text-sm">
        <dt>{t.subtotal}</dt>
        <dd className="text-right tabular-nums">{m(order.subtotal_amount)}</dd>
        {order.shipping_amount ? (
          <>
            <dt>{t.shipping}</dt>
            <dd className="text-right tabular-nums">{m(order.shipping_amount)}</dd>
          </>
        ) : null}
        {taxed ? (
          <>
            <dt>{t.taxBase(rate)}</dt>
            <dd className="text-right tabular-nums">
              {mode === 'TAX_INCLUDED' ? (
                <>
                  {m(order.total_amount)}
                  <span className="block text-xs">{t.taxIncluded(m(order.tax_amount))}</span>
                </>
              ) : (
                m(order.total_amount - order.tax_amount)
              )}
            </dd>
            {mode === 'TAX_EXCLUDED' ? (
              <>
                <dt>{t.taxExcluded('').trim()}</dt>
                <dd className="text-right tabular-nums">{m(order.tax_amount)}</dd>
              </>
            ) : null}
          </>
        ) : (
          <>
            <dt className="text-neutral-500">{t.noTax}</dt>
            <dd />
          </>
        )}
        <dt className="border-t border-black pt-1 font-bold">{t.grandTotal}</dt>
        <dd className="border-t border-black pt-1 text-right font-bold tabular-nums">{m(order.total_amount)}</dd>
      </dl>
    </article>
  )
}
