import { createFileRoute } from '@tanstack/react-router'
import { cmsPageDetailSearchSchema } from '@/features/cms/pages/search'
import { MiliTalksLandingPage } from '@/features/cms/stories/pages/mili-talks-landing-page'

export const Route = createFileRoute('/_app/cms/mili-talks')({
  staticData: { crumb: { title: 'Mili Talks · Trang chủ blog' } },
  validateSearch: cmsPageDetailSearchSchema,
  component: MiliTalksLandingPage,
})
