import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { z } from 'zod'
import { useAppForm } from '@/components/form/form-hook'
import { authService } from '../auth.service'

export const setupSchema = z
  .object({
    email: z.email('Email không hợp lệ').max(320),
    password: z.string().min(12, 'Tối thiểu 12 ký tự').max(128),
    confirmPassword: z.string(),
    setupToken: z.string().max(512),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: 'Mật khẩu nhập lại không khớp',
    path: ['confirmPassword'],
  })

/** Creates the first Admin; setup never opens a session, so the owner signs in afterwards. */
export function useSetupPage() {
  const navigate = useNavigate()

  const setup = useMutation({
    mutationFn: authService.setup,
    onSuccess: async () => {
      toast.success('Đã tạo tài khoản Admin. Hãy đăng nhập để tiếp tục.')
      await navigate({ to: '/login' })
    },
  })

  const form = useAppForm({
    defaultValues: { email: '', password: '', confirmPassword: '', setupToken: '' },
    validators: { onSubmit: setupSchema },
    onSubmit: ({ value }) =>
      setup
        .mutateAsync({ email: value.email, password: value.password, setupToken: value.setupToken.trim() || undefined })
        .catch(() => undefined),
  })

  return { form, error: setup.error }
}
