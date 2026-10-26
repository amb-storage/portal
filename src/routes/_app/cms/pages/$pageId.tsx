import { createFileRoute, redirect } from '@tanstack/react-router'
import { LoadingBlock } from '@/components/common/query-state'
import { pageDetailQuery } from '@/features/cms/pages/queries'
import { CmsPageDetailPage } from '@/features/cms/pages/pages/cms-page-detail-page'
import { cmsPageDetailSearchSchema } from '@/features/cms/pages/search'
import type { CmsPage } from '@/features/cms/pages/types'

export const Route = createFileRoute('/_app/cms/pages/$pageId')({
  staticData: {
    crumb: {
      title: (page: CmsPage) => page.slug,
      parent: { title: 'Trang', to: '/cms/pages' },
    },
  },
  validateSearch: cmsPageDetailSearchSchema,
  loader: async ({ context, params, location }) => {
    const page = await context.queryClient.ensureQueryData(pageDetailQuery(params.pageId))
    // About and Policy have their own screens; old links land there.
    if (page.type === 'ABOUT') throw redirect({ to: '/cms/about', search: location.search, replace: true })
    if (page.type === 'POLICY') throw redirect({ to: '/cms/policies/$pageId', params, search: location.search, replace: true })
    return page
  },
  pendingComponent: LoadingBlock,
  component: CmsPageDetailPage,
})
