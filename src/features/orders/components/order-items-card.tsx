import { Link } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatMoney } from '@/lib/format'
import type { OrderItem } from '../types'

export function OrderItemsCard({ items, currency }: { items: OrderItem[]; currency: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sản phẩm trong đơn</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sản phẩm</TableHead>
              <TableHead className="text-right">Đơn giá</TableHead>
              <TableHead className="text-right">SL</TableHead>
              <TableHead className="text-right">Thành tiền</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => (
              <TableRow key={`${item.product_id}-${index}`}>
                <TableCell>
                  <Link to="/catalog/products/$productId" params={{ productId: item.product_id }} className="grid gap-0.5 hover:underline">
                    <span className="font-medium">{item.product_name ?? item.product_id}</span>
                    {item.product_slug ? <code className="text-xs text-muted-foreground">{item.product_slug}</code> : null}
                  </Link>
                </TableCell>
                <TableCell className="text-right tabular-nums">{formatMoney(item.unit_price, currency)}</TableCell>
                <TableCell className="text-right tabular-nums">{item.quantity}</TableCell>
                <TableCell className="text-right tabular-nums">{formatMoney(item.line_total, currency)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
