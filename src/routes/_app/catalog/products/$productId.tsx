import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { LoadingBlock } from '@/components/common/query-state'
import { productDetailQuery } from '@/features/catalog/products/queries'
import { ProductDetailPage } from '@/features/catalog/products/pages/product-detail-page'
import type { Product } from '@/features/catalog/products/types'

export const Route = createFileRoute('/_app/catalog/products/$productId')({
  staticData: {
    crumb: {
      title: (product: Product) => product.nameEn || product.nameJa || 'Sản phẩm chưa đặt tên',
      parent: { title: 'Sản phẩm', to: '/catalog/products' },
    },
  },
  validateSearch: z.object({
    tab: z.enum(['general', 'media', 'aliases']).default('general').catch('general'),
  }),
  loader: ({ context, params }) => context.queryClient.ensureQueryData(productDetailQuery(params.productId)),
  pendingComponent: LoadingBlock,
  component: ProductDetailPage,
})
