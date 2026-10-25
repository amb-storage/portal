import { createFileRoute } from '@tanstack/react-router'
import { GuidePage } from '@/features/guide/pages/guide-page'

export const Route = createFileRoute('/_app/guide')({
  staticData: { crumb: { title: 'Hướng dẫn' } },
  component: GuidePage,
})
