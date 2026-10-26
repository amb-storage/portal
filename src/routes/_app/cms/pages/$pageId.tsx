import { createFileRoute } from '@tanstack/react-router'
import { LoadingBlock } from '@/components/common/query-state'
import { pageDetailQuery } from '@/features/cms/pages/queries'
import { CmsPageDetailPage } from '@/features/cms/pages/pages/cms-page-detail-page'
import { cmsPageDetailSearchSchema } from '@/features/cms/pages/search'
import type { CmsPage } from '@/features/cms/pages/types'

export const Route = createFileRoute('/_app/cms/pages/$pageId')({
  staticData: {
    crumb: {
      title: (page: CmsPage) => page.slug,
      parent: (page: CmsPage) =>
        page.type === 'POLICY'
          ? { title: 'Chính sách', to: '/cms/policies' }
          : page.type === 'ABOUT'
            ? { title: 'Giới thiệu', to: '/cms/about' }
            : { title: 'Trang', to: '/cms/pages' },
    },
  },
  validateSearch: cmsPageDetailSearchSchema,
  loader: ({ context, params }) => context.queryClient.ensureQueryData(pageDetailQuery(params.pageId)),
  pendingComponent: LoadingBlock,
  component: CmsPageDetailPage,
})
