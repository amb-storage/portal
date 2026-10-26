import { createFileRoute } from '@tanstack/react-router'
import { StoriesPage } from '@/features/cms/stories/pages/stories-page'
import { storySearchSchema } from '@/features/cms/stories/search'

export const Route = createFileRoute('/_app/cms/stories/')({
  staticData: { crumb: { title: 'Mili Talks · Bài viết' } },
  validateSearch: storySearchSchema,
  component: StoriesPage,
})
