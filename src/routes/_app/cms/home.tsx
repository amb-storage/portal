import { createFileRoute } from '@tanstack/react-router'
import { HomePageEditor } from '@/features/cms/home/pages/home-page-editor'

export const Route = createFileRoute('/_app/cms/home')({
  staticData: { crumb: { title: 'Trang chủ' } },
  component: HomePageEditor,
})
