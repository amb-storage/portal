import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ContentEditor } from '@/features/cms/editor/content-editor'
import type { ContentProfile } from '@/features/cms/editor/types'
import type { DraftForm as DraftFormApi } from '../hooks/use-draft-editor'
import { validateContent } from '../draft-values'
import { sectionRegistryQuery } from '../queries'

interface DraftFormProps {
  form: DraftFormApi
  revisionLabel: string
  readOnly: boolean
  profile: ContentProfile
}

/** Shared editor for page drafts and fixed ABOUT/POLICY content. */
export function DraftForm({ form, revisionLabel, readOnly, profile }: DraftFormProps) {
  const registry = useQuery(sectionRegistryQuery)
  return (
    <form
      className="grid gap-6"
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      <fieldset disabled={readOnly} className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tiêu đề & SEO</CardTitle>
            <CardDescription>{revisionLabel}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <form.AppField name="titleJa">{(field) => <field.TextField label="Tiêu đề (Nhật)" />}</form.AppField>
            <form.AppField name="titleEn">{(field) => <field.TextField label="Tiêu đề (Anh)" />}</form.AppField>
            <form.AppField name="seoTitleJa">{(field) => <field.TextField label="Tiêu đề SEO (Nhật)" />}</form.AppField>
            <form.AppField name="seoTitleEn">{(field) => <field.TextField label="Tiêu đề SEO (Anh)" />}</form.AppField>
            <form.AppField name="seoDescriptionJa">{(field) => <field.TextareaField label="Mô tả SEO (Nhật)" rows={2} />}</form.AppField>
            <form.AppField name="seoDescriptionEn">{(field) => <field.TextareaField label="Mô tả SEO (Anh)" rows={2} />}</form.AppField>
            <form.AppField name="effectiveAt">
              {(field) => <field.TextField label="Hiệu lực từ" type="datetime-local" description="Bắt buộc với trang POLICY" />}
            </form.AppField>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Nội dung</CardTitle>
            <CardDescription>Thêm các khối (đoạn văn, ảnh, trích dẫn…) theo thứ tự hiển thị trên trang.</CardDescription>
          </CardHeader>
          <CardContent>
            <form.Field name="content" validators={{ onSubmit: ({ value }) => validateContent(value, registry.data) }}>
              {(field) => (
                <div className="grid gap-2">
                  <ContentEditor value={field.state.value} onChange={field.handleChange} profile={profile} readOnly={readOnly} />
                  {field.state.meta.errors.length ? <p className="text-sm text-destructive">{String(field.state.meta.errors[0])}</p> : null}
                </div>
              )}
            </form.Field>
          </CardContent>
        </Card>
      </fieldset>
      {readOnly ? null : (
        <form.AppForm>
          <form.StickySaveBar>
            <form.SubmitButton requireDirty>Lưu nháp</form.SubmitButton>
          </form.StickySaveBar>
        </form.AppForm>
      )}
    </form>
  )
}
