import { createFileRoute } from '@tanstack/react-router'
import { LoadingBlock } from '@/components/common/query-state'
import { pageDetailQuery } from '@/features/cms/pages/queries'
import { cmsPageDetailSearchSchema } from '@/features/cms/pages/search'
import type { CmsPage } from '@/features/cms/pages/types'
import { StoryDetailPage } from '@/features/cms/stories/pages/story-detail-page'

export const Route = createFileRoute('/_app/cms/stories/$pageId')({
  staticData: {
    crumb: {
      title: (page: CmsPage) => page.slug,
      parent: { title: 'Mili Talks · Bài viết', to: '/cms/stories' },
    },
  },
  validateSearch: cmsPageDetailSearchSchema,
  loader: ({ context, params }) => context.queryClient.ensureQueryData(pageDetailQuery(params.pageId)),
  pendingComponent: LoadingBlock,
  component: StoryDetailPage,
})
