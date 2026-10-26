import { createFileRoute } from '@tanstack/react-router'
import { PoliciesPage } from '@/features/cms/pages/pages/policies-page'

export const Route = createFileRoute('/_app/cms/policies/')({
  staticData: { crumb: { title: 'Chính sách' } },
  component: PoliciesPage,
})
