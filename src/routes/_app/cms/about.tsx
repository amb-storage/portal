import { createFileRoute } from '@tanstack/react-router'
import { AboutPage } from '@/features/cms/pages/pages/about-page'
import { cmsPageDetailSearchSchema } from '@/features/cms/pages/search'

export const Route = createFileRoute('/_app/cms/about')({
  staticData: { crumb: { title: 'Giới thiệu' } },
  validateSearch: cmsPageDetailSearchSchema,
  component: AboutPage,
})
