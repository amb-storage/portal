import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface RefundDialogProps {
  disabled: boolean
  isPending: boolean
  onRefund: (reason?: string) => void
}

export function RefundDialog({ disabled, isPending, onRefund }: RefundDialogProps) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" disabled={disabled}>Hoàn tiền</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hoàn tiền đơn hàng?</DialogTitle>
          <DialogDescription>
            Hoàn toàn bộ tiền qua Stripe. Tồn kho không tự cộng lại — nếu cần, hãy điều chỉnh tồn kho ở trang sản phẩm.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="refund-reason">Lý do (không bắt buộc)</Label>
          <Textarea id="refund-reason" value={reason} maxLength={500} rows={3} onChange={(event) => setReason(event.target.value)} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Huỷ</Button>
          <Button
            variant="destructive"
            disabled={isPending}
            onClick={() => {
              onRefund(reason.trim() || undefined)
              setOpen(false)
            }}
          >
            Hoàn tiền
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
