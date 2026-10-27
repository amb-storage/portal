import { createFileRoute } from '@tanstack/react-router'
import { LoadingBlock } from '@/components/common/query-state'
import { blogPostQuery } from '@/features/cms/stories/blog.queries'
import type { BlogPostDetail } from '@/features/cms/stories/blog.types'
import { StoryDetailPage } from '@/features/cms/stories/pages/story-detail-page'

export const Route = createFileRoute('/_app/cms/stories/$postId')({
  staticData: {
    crumb: {
      title: (post: BlogPostDetail) => post.slug,
      parent: { title: 'Mili Talks · Bài viết', to: '/cms/stories' },
    },
  },
  loader: ({ context, params }) => context.queryClient.ensureQueryData(blogPostQuery(params.postId)),
  pendingComponent: LoadingBlock,
  component: StoryDetailPage,
})
