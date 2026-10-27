import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { LoadingBlock } from '@/components/common/query-state'
import { StoryDetailPage } from '@/features/cms/stories/pages/story-detail-page'
import { storyDetailQuery } from '@/features/cms/stories/queries'
import { storyTitle, type StoryDetail } from '@/features/cms/stories/types'

export const Route = createFileRoute('/_app/cms/stories/$storyId')({
  staticData: {
    crumb: {
      title: (story: StoryDetail) => storyTitle(story),
      parent: { title: 'Mili Talks · Bài viết', to: '/cms/stories' },
    },
  },
  validateSearch: z.object({ tab: z.enum(['content', 'versions', 'settings']).default('content').catch('content') }),
  loader: ({ context, params }) => context.queryClient.ensureQueryData(storyDetailQuery(params.storyId)),
  pendingComponent: LoadingBlock,
  component: StoryDetailPage,
})
