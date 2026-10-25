import { ErrorAlert } from '@/components/common/query-state'
import type { useLoginPage } from '../hooks/use-login-page'

type LoginFormProps = ReturnType<typeof useLoginPage>

export function LoginForm({ form, error }: LoginFormProps) {
  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      <ErrorAlert error={error} title="Đăng nhập thất bại" />
      <form.AppField name="email">
        {(field) => <field.TextField label="Email" type="email" autoComplete="username" />}
      </form.AppField>
      <form.AppField name="password">
        {(field) => <field.TextField label="Mật khẩu" type="password" autoComplete="current-password" />}
      </form.AppField>
      <form.AppForm>
        <form.SubmitButton>Đăng nhập</form.SubmitButton>
      </form.AppForm>
    </form>
  )
}
