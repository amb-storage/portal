import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod'
import { meQueryOptions } from '@/features/auth/queries'
import { LoginPage } from '@/features/auth/pages/login-page'

export const Route = createFileRoute('/login')({
  validateSearch: z.object({ redirect: z.string().startsWith('/').optional().catch(undefined) }),
  beforeLoad: async ({ context }) => {
    const me = await context.queryClient.ensureQueryData(meQueryOptions)
    if (me) throw redirect({ to: '/' })
  },
  component: LoginPage,
})
