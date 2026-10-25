import { useProductForm } from '../hooks/use-product-form'
import type { Product } from '../types'
import { ProductForm } from './product-form'

/** Key this by the query's dataUpdatedAt so the form re-initializes after each save. */
export function ProductGeneralTab({ product, canManage }: { product: Product; canManage: boolean }) {
  const { form } = useProductForm(product, () => undefined)
  return (
    <ProductForm
      form={form}
      submitLabel="Lưu sản phẩm"
      slugLocked={product.status === 'PUBLISHED'}
      isEdit
      readOnly={!canManage}
    />
  )
}
