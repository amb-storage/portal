import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { NavigationPage } from '@/features/navigation/pages/navigation-page'
import { MENU_KEYS } from '@/features/navigation/types'

export const Route = createFileRoute('/_app/navigation')({
  staticData: { crumb: { title: 'Menu điều hướng' } },
  validateSearch: z.object({ menu: z.enum(MENU_KEYS).default('HEADER').catch('HEADER') }),
  component: NavigationPage,
})
