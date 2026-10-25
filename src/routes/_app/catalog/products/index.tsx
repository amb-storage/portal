import { createFileRoute } from '@tanstack/react-router'
import { ProductsPage } from '@/features/catalog/products/pages/products-page'
import { productSearchSchema } from '@/features/catalog/products/search'

export const Route = createFileRoute('/_app/catalog/products/')({
  staticData: { crumb: { title: 'Sản phẩm' } },
  validateSearch: productSearchSchema,
  component: ProductsPage,
})
