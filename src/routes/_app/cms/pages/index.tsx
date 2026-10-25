import { createFileRoute } from '@tanstack/react-router'
import { CmsPagesPage } from '@/features/cms/pages/pages/cms-pages-page'
import { cmsPageSearchSchema } from '@/features/cms/pages/search'

export const Route = createFileRoute('/_app/cms/pages/')({
  staticData: { crumb: { title: 'Trang' } },
  validateSearch: cmsPageSearchSchema,
  component: CmsPagesPage,
})
