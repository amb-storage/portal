import { createFileRoute } from '@tanstack/react-router'
import { AccountPage } from '@/features/auth/pages/account-page'

export const Route = createFileRoute('/_app/account')({
  staticData: { crumb: { title: 'Tài khoản' } },
  component: AccountPage,
})
