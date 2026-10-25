import { ConfirmButton } from '@/components/common/confirm-button'
import type { Product } from '../types'

interface ProductActionsProps {
  product: Product
  canPublish: boolean
  /** All publish checklist items are satisfied. */
  ready: boolean
  isPending: boolean
  onAction: (action: 'publish' | 'unpublish') => void
}

export function ProductActions({ product, canPublish, ready, isPending, onAction }: ProductActionsProps) {
  if (!canPublish) return null
  if (product.status === 'DRAFT')
    return (
      <ConfirmButton
        disabled={isPending || !ready}
        title="Đăng bán sản phẩm?"
        description="Sản phẩm sẽ hiển thị trên cửa hàng."
        confirmLabel="Đăng bán"
        onConfirm={() => onAction('publish')}
      >
        {ready ? 'Đăng bán' : 'Chưa đủ thông tin để đăng bán'}
      </ConfirmButton>
    )
  if (product.status === 'PUBLISHED')
    return (
      <ConfirmButton
        variant="outline"
        disabled={isPending}
        title="Ngừng bán sản phẩm?"
        description="Sản phẩm trở về Nháp và không còn hiển thị trên cửa hàng."
        confirmLabel="Ngừng bán"
        onConfirm={() => onAction('unpublish')}
      >
        Ngừng bán
      </ConfirmButton>
    )
  return null
}
