import { useState } from 'react'
import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi, Link } from '@tanstack/react-router'
import { ArrowLeft, Plus, Printer, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { settingsQuery } from '@/features/settings/queries'
import { orderDetailQuery } from '../queries'
import { defaultAddressee, type InvoiceKind, type InvoiceLang, type InvoiceOptions } from './invoice-data'
import { InvoiceSheet } from './invoice-sheet'

const route = getRouteApi('/_app/orders/invoice/$orderId')

const today = () => new Date().toLocaleDateString('sv-SE')

function Toggle<T extends string>({ value, options, onChange }: { value: T; options: Array<[T, string]>; onChange: (next: T) => void }) {
  return (
    <div className="inline-flex rounded-lg border bg-muted/40 p-0.5 text-sm">
      {options.map(([key, label]) => (
        <button key={key} type="button" onClick={() => onChange(key)} className={cn('rounded-md px-3 py-1 text-muted-foreground', value === key && 'bg-background text-foreground shadow-xs')}>
          {label}
        </button>
      ))}
    </div>
  )
}

/** Print an invoice/receipt for one Order; edits here are for this print only (not stored). */
export function InvoicePage() {
  const { orderId } = route.useParams()
  const { data } = useSuspenseQuery(orderDetailQuery(orderId))
  // Fixed rows live in Store Settings; an Admin without settings.read still gets the Order part.
  const settings = useQuery(settingsQuery)
  const { order, items } = data
  const [options, setOptions] = useState<InvoiceOptions>(() => ({
    kind: order.status === 'PAID' ? 'receipt' : 'invoice',
    lang: 'ja',
    number: order.order_number,
    issueDate: today(),
    addressee: defaultAddressee(order),
    purpose: 'お品代として',
    extraRows: [],
  }))
  const set = <K extends keyof InvoiceOptions>(key: K, value: InvoiceOptions[K]) => setOptions((current) => ({ ...current, [key]: value }))
  const setLang = (lang: InvoiceLang) =>
    setOptions((current) => ({
      ...current,
      lang,
      // Swap the default purpose text with the language, but keep anything the Admin typed.
      purpose: current.purpose === 'お品代として' && lang === 'en' ? 'Merchandise' : current.purpose === 'Merchandise' && lang === 'ja' ? 'お品代として' : current.purpose,
    }))
  const fields = settings.data?.invoiceFields ?? []

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[320px_1fr]">
      <aside className="grid gap-4 print:hidden lg:sticky lg:top-20">
        <Button asChild variant="ghost" size="sm" className="justify-self-start">
          <Link to="/orders/$orderId" params={{ orderId }}>
            <ArrowLeft /> Về đơn {order.order_number}
          </Link>
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Xuất hoá đơn</CardTitle>
            <CardDescription>Chỉnh cho lần in này (không lưu). Dòng cố định sửa ở Cài đặt → Hoá đơn.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm">
            <div className="grid gap-1.5">
              <Label>Loại chứng từ</Label>
              <Toggle<InvoiceKind> value={options.kind} onChange={(kind) => set('kind', kind)} options={[['receipt', '領収書 (biên nhận)'], ['invoice', '請求書 (hoá đơn)']]} />
            </div>
            <div className="grid gap-1.5">
              <Label>Ngôn ngữ</Label>
              <Toggle<InvoiceLang> value={options.lang} onChange={setLang} options={[['ja', 'Tiếng Nhật'], ['en', 'Tiếng Anh']]} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="invoice-number">Số chứng từ</Label>
              <Input id="invoice-number" value={options.number} onChange={(event) => set('number', event.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="invoice-date">Ngày xuất</Label>
              <Input id="invoice-date" type="date" value={options.issueDate} onChange={(event) => set('issueDate', event.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="invoice-addressee">Người nhận (宛名)</Label>
              <Input id="invoice-addressee" value={options.addressee} onChange={(event) => set('addressee', event.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="invoice-purpose">Nội dung (但し書き)</Label>
              <Input id="invoice-purpose" value={options.purpose} onChange={(event) => set('purpose', event.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Dòng thêm cho lần này</Label>
              {options.extraRows.map((row, index) => (
                <div key={row.id} className="grid grid-cols-[1fr_1.4fr_auto] gap-1.5">
                  <Input
                    aria-label="Tên dòng"
                    placeholder="Tên dòng"
                    value={row.label}
                    onChange={(event) => set('extraRows', options.extraRows.map((other, i) => (i === index ? { ...other, label: event.target.value } : other)))}
                  />
                  <Input
                    aria-label="Nội dung"
                    placeholder="Nội dung"
                    value={row.value}
                    onChange={(event) => set('extraRows', options.extraRows.map((other, i) => (i === index ? { ...other, value: event.target.value } : other)))}
                  />
                  <Button type="button" size="icon" variant="ghost" aria-label="Xoá dòng" onClick={() => set('extraRows', options.extraRows.filter((_, i) => i !== index))}>
                    <Trash2 />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" className="justify-self-start" onClick={() => set('extraRows', [...options.extraRows, { id: crypto.randomUUID(), label: '', value: '' }])}>
                <Plus /> Thêm dòng
              </Button>
            </div>
            {settings.isError ? <p className="text-xs text-muted-foreground">Không đọc được Cài đặt nên hoá đơn chưa có các dòng cố định.</p> : null}
            {settings.data && fields.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Chưa có dòng cố định (số đăng ký, địa chỉ…). Thêm ở{' '}
                <Link to="/settings" hash="invoice" className="underline">
                  Cài đặt → Hoá đơn
                </Link>
                .
              </p>
            ) : null}
            <Button type="button" onClick={() => window.print()}>
              <Printer /> In / Lưu PDF
            </Button>
          </CardContent>
        </Card>
      </aside>
      <div className="min-w-0 overflow-x-auto rounded-lg border bg-muted/30 p-4 print:overflow-visible print:border-0 print:bg-transparent print:p-0">
        <InvoiceSheet order={order} items={items} storeName={settings.data?.storeName ?? null} contactPhone={settings.data?.contactPhone ?? null} fields={fields} options={options} />
      </div>
    </div>
  )
}
