import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDateTime } from '@/lib/format'
import { usePageSettingsForm } from '../hooks/use-page-settings-form'
import type { CmsPage } from '../types'

export function SettingsTab({ page, canEdit }: { page: CmsPage; canEdit: boolean }) {
  const form = usePageSettingsForm(page)
  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin trang</CardTitle>
        <CardDescription>
          Type {page.type} · created {formatDateTime(page.createdAt)} · first published {formatDateTime(page.firstPublishedAt)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="flex items-end gap-2"
          onSubmit={(event) => {
            event.preventDefault()
            void form.handleSubmit()
          }}
        >
          <fieldset disabled={!canEdit} className="flex-1">
            <form.AppField name="slug">{(field) => <field.TextField label="Slug (đường dẫn)" />}</form.AppField>
          </fieldset>
          {canEdit ? (
            <form.AppForm>
              <form.SubmitButton requireDirty>Lưu slug</form.SubmitButton>
            </form.AppForm>
          ) : null}
        </form>
      </CardContent>
    </Card>
  )
}
