import { createFileRoute, redirect } from '@tanstack/react-router'
import { LoadingBlock } from '@/components/common/query-state'
import { pageDetailQuery } from '@/features/cms/pages/queries'
import { PolicyDetailPage } from '@/features/cms/pages/pages/policy-detail-page'
import { cmsPageDetailSearchSchema } from '@/features/cms/pages/search'
import type { CmsPage } from '@/features/cms/pages/types'

export const Route = createFileRoute('/_app/cms/policies/$pageId')({
  staticData: {
    crumb: {
      title: (page: CmsPage) => page.slug,
      parent: { title: 'Chính sách', to: '/cms/policies' },
    },
  },
  validateSearch: cmsPageDetailSearchSchema,
  loader: async ({ context, params }) => {
    const page = await context.queryClient.ensureQueryData(pageDetailQuery(params.pageId))
    if (page.type !== 'POLICY') throw redirect({ to: '/cms/pages/$pageId', params, replace: true })
    return page
  },
  pendingComponent: LoadingBlock,
  component: PolicyDetailPage,
})
