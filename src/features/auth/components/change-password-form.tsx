import { ErrorAlert } from '@/components/common/query-state'
import type { useChangePasswordPage } from '../hooks/use-change-password-page'

type ChangePasswordFormProps = ReturnType<typeof useChangePasswordPage>

export function ChangePasswordForm({ form, error }: ChangePasswordFormProps) {
  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      <ErrorAlert error={error} title="Không đổi được mật khẩu" />
      <form.AppField name="currentPassword">
        {(field) => <field.TextField label="Mật khẩu hiện tại" type="password" autoComplete="current-password" />}
      </form.AppField>
      <form.AppField name="newPassword">
        {(field) => (
          <field.TextField label="Mật khẩu mới" type="password" autoComplete="new-password" description="12–128 ký tự" />
        )}
      </form.AppField>
      <form.AppField name="confirmPassword">
        {(field) => <field.TextField label="Nhập lại mật khẩu mới" type="password" autoComplete="new-password" />}
      </form.AppField>
      <form.AppForm>
        <form.SubmitButton>Đổi mật khẩu</form.SubmitButton>
      </form.AppForm>
    </form>
  )
}
