import { createFileRoute } from '@tanstack/react-router'
import { CategoriesPage } from '@/features/catalog/categories/pages/categories-page'
import { categorySearchSchema } from '@/features/catalog/categories/search'

export const Route = createFileRoute('/_app/catalog/categories')({
  staticData: { crumb: { title: 'Danh mục' } },
  validateSearch: categorySearchSchema,
  component: CategoriesPage,
})
