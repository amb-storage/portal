import { ErrorAlert } from '@/components/common/query-state'
import type { useSetupPage } from '../hooks/use-setup-page'

type SetupFormProps = ReturnType<typeof useSetupPage>

export function SetupForm({ form, error }: SetupFormProps) {
  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      <ErrorAlert error={error} title="Thiết lập thất bại" />
      <form.AppField name="email">
        {(field) => <field.TextField label="Email" type="email" autoComplete="username" />}
      </form.AppField>
      <form.AppField name="password">
        {(field) => (
          <field.TextField label="Mật khẩu" type="password" autoComplete="new-password" description="12–128 ký tự" />
        )}
      </form.AppField>
      <form.AppField name="confirmPassword">
        {(field) => <field.TextField label="Nhập lại mật khẩu" type="password" autoComplete="new-password" />}
      </form.AppField>
      <form.AppField name="setupToken">
        {(field) => (
          <field.TextField
            label="Mã thiết lập (setup token)"
            type="password"
            autoComplete="off"
            description="Bắt buộc trên staging và production. Chạy local thì để trống."
          />
        )}
      </form.AppField>
      <form.AppForm>
        <form.SubmitButton>Tạo tài khoản Admin</form.SubmitButton>
      </form.AppForm>
    </form>
  )
}
