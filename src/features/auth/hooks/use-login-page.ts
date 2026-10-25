import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import { useAppForm } from '@/components/form/form-hook'
import { authService } from '../auth.service'
import { authKeys } from '../queries'

const route = getRouteApi('/login')

export const loginSchema = z.object({
  email: z.email('Email không hợp lệ'),
  password: z.string().min(1, 'Nhập mật khẩu').max(128),
})

export function useLoginPage() {
  const { redirect } = route.useSearch()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const login = useMutation({
    mutationFn: authService.login,
    onSuccess: async ({ admin, session }) => {
      queryClient.setQueryData(authKeys.me, { admin, session })
      if (admin.mustChangePassword) return navigate({ to: '/change-password' })
      return navigate({ to: redirect ?? '/' })
    },
  })

  const form = useAppForm({
    defaultValues: { email: '', password: '' },
    validators: { onSubmit: loginSchema },
    onSubmit: ({ value }) => login.mutateAsync(value).catch(() => undefined),
  })

  return { form, error: login.error }
}
