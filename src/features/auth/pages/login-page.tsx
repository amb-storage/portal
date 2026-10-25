import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { AuthCard } from '../components/auth-card'
import { LoginForm } from '../components/login-form'
import { useLoginPage } from '../hooks/use-login-page'
import { setupStatusQueryOptions } from '../queries'

export function LoginPage() {
  const page = useLoginPage()
  const setup = useQuery(setupStatusQueryOptions)
  return (
    <AuthCard title="Đăng nhập" description="Trang quản trị AMB:STORAGE">
      <LoginForm {...page} />
      {setup.data?.available ? (
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Chưa có tài khoản Admin nào.{' '}
          <Link to="/setup" className="font-medium text-foreground underline">
            Thiết lập lần đầu
          </Link>
        </p>
      ) : null}
    </AuthCard>
  )
}
