import { createFileRoute } from '@tanstack/react-router'
import { ProductCreatePage } from '@/features/catalog/products/pages/product-create-page'

export const Route = createFileRoute('/_app/catalog/products/new')({
  staticData: { crumb: { title: 'Thêm sản phẩm', parent: { title: 'Sản phẩm', to: '/catalog/products' } } },
  component: ProductCreatePage,
})
