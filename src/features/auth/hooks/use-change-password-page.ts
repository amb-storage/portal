import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { z } from 'zod'
import { useAppForm } from '@/components/form/form-hook'
import { authService } from '../auth.service'
import { authKeys } from '../queries'

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Nhập mật khẩu hiện tại').max(128),
    newPassword: z.string().min(12, 'Tối thiểu 12 ký tự').max(128),
    confirmPassword: z.string(),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: 'Mật khẩu nhập lại không khớp',
    path: ['confirmPassword'],
  })

export function useChangePasswordPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const changePassword = useMutation({
    mutationFn: authService.changePassword,
    onSuccess: async ({ admin, session }) => {
      queryClient.setQueryData(authKeys.me, { admin, session })
      await queryClient.invalidateQueries({ queryKey: authKeys.sessions })
      toast.success('Đã đổi mật khẩu')
      await navigate({ to: '/' })
    },
  })

  const form = useAppForm({
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
    validators: { onSubmit: changePasswordSchema },
    onSubmit: ({ value }) =>
      changePassword
        .mutateAsync({ currentPassword: value.currentPassword, newPassword: value.newPassword })
        .catch(() => undefined),
  })

  return { form, error: changePassword.error }
}
