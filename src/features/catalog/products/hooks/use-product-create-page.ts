import { useNavigate } from '@tanstack/react-router'
import { useProductForm } from './use-product-form'

/** After creating, open the product on the Media tab: images are the usual next step. */
export function useProductCreatePage() {
  const navigate = useNavigate()
  return useProductForm(undefined, (product) =>
    navigate({ to: '/catalog/products/$productId', params: { productId: product.id }, search: { tab: 'media' } }),
  )
}
