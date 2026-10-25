import { createFileRoute } from '@tanstack/react-router'
import { MediaPage } from '@/features/media/pages/media-page'
import { mediaSearchSchema } from '@/features/media/search'

export const Route = createFileRoute('/_app/media')({
  staticData: { crumb: { title: 'Thư viện ảnh' } },
  validateSearch: mediaSearchSchema,
  component: MediaPage,
})
