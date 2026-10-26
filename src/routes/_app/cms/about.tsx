import { createFileRoute } from '@tanstack/react-router'
import { AboutPage } from '@/features/cms/pages/pages/about-page'

export const Route = createFileRoute('/_app/cms/about')({
  staticData: { crumb: { title: 'Giới thiệu' } },
  component: AboutPage,
})
