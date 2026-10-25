import { createFileRoute, redirect } from '@tanstack/react-router'
import { meQueryOptions } from '@/features/auth/queries'
import { ChangePasswordPage } from '@/features/auth/pages/change-password-page'

export const Route = createFileRoute('/change-password')({
  beforeLoad: async ({ context, location }) => {
    const me = await context.queryClient.ensureQueryData(meQueryOptions)
    if (!me) throw redirect({ to: '/login', search: { redirect: location.href } })
  },
  component: ChangePasswordPage,
})
