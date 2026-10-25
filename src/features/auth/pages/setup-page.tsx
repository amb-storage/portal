import { AuthCard } from '../components/auth-card'
import { SetupForm } from '../components/setup-form'
import { useSetupPage } from '../hooks/use-setup-page'

export function SetupPage() {
  const page = useSetupPage()
  return (
    <AuthCard title="Thiết lập lần đầu" description="Tạo tài khoản Admin chủ cửa hàng. Chỉ dùng được khi chưa có Admin nào.">
      <SetupForm {...page} />
    </AuthCard>
  )
}
