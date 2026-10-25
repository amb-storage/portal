import { createFileRoute, redirect } from '@tanstack/react-router'
import { meQueryOptions, setupStatusQueryOptions } from '@/features/auth/queries'
import { SetupPage } from '@/features/auth/pages/setup-page'

export const Route = createFileRoute('/setup')({
  beforeLoad: async ({ context }) => {
    const me = await context.queryClient.ensureQueryData(meQueryOptions)
    if (me) throw redirect({ to: '/' })
    const status = await context.queryClient.fetchQuery(setupStatusQueryOptions)
    if (!status.available) throw redirect({ to: '/login' })
  },
  component: SetupPage,
})
