import { createFileRoute, redirect } from '@tanstack/react-router'
import { LoadingBlock } from '@/components/common/query-state'
import { pageDetailQuery } from '@/features/cms/pages/queries'
import { CmsPageDetailPage } from '@/features/cms/pages/pages/cms-page-detail-page'
import { cmsPageDetailSearchSchema } from '@/features/cms/pages/search'
import type { CmsPage } from '@/features/cms/pages/types'
import { storyListQuery } from '@/features/cms/stories/queries'
import { MILI_TALKS_LANDING_SLUG } from '@/features/cms/stories/mili-talks-template'

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
    // Mili Talks has its own menu: the blog home and every article open under it.
    if (page.type === 'LANDING' && page.slug === MILI_TALKS_LANDING_SLUG) throw redirect({ to: '/cms/mili-talks', search: location.search, replace: true })
    if (page.type === 'STANDARD') {
      const stories = await context.queryClient.fetchQuery(storyListQuery({ page: 1, limit: 20, q: page.slug }))
      const story = stories.items.find((candidate) => candidate.pageId === page.id)
      if (story) throw redirect({ to: '/cms/stories/$storyId', params: { storyId: story.id }, replace: true })
    }
    return page
  },
  pendingComponent: LoadingBlock,
  component: CmsPageDetailPage,
})
