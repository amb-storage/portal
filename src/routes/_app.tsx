import { createFileRoute, redirect } from '@tanstack/react-router'
import { AppShell } from '@/components/layout/app-shell'
import { meQueryOptions } from '@/features/auth/queries'

/** Authenticated layout: requires an Admin session and a non-temporary password. */
export const Route = createFileRoute('/_app')({
  beforeLoad: async ({ context, location }) => {
    const me = await context.queryClient.ensureQueryData(meQueryOptions)
    if (!me) throw redirect({ to: '/login', search: { redirect: location.href } })
    if (me.admin.mustChangePassword) throw redirect({ to: '/change-password' })
  },
  component: AppShell,
})
