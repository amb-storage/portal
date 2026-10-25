import { AuthCard } from '../components/auth-card'
import { ChangePasswordForm } from '../components/change-password-form'
import { useChangePasswordPage } from '../hooks/use-change-password-page'

export function ChangePasswordPage() {
  const page = useChangePasswordPage()
  return (
    <AuthCard title="Đổi mật khẩu" description="Các thiết bị khác vẫn giữ đăng nhập.">
      <ChangePasswordForm {...page} />
    </AuthCard>
  )
}
