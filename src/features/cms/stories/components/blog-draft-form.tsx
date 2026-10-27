import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { QueryState } from '@/components/common/query-state'
import { ContentEditor } from '@/features/cms/editor/content-editor'
import { blogSectionRegistryQuery } from '../blog.queries'
import { validateBlogContent } from '../blog-draft-values'
import type { BlogDraftForm } from '../hooks/use-blog-draft-form'

export function BlogDraftForm({ form, readOnly, revisionLabel }: { form: BlogDraftForm; readOnly: boolean; revisionLabel: string }) {
  const registry = useQuery(blogSectionRegistryQuery)
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
            <CardTitle>Thông tin bài viết</CardTitle>
            <CardDescription>{revisionLabel}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <form.AppField name="titleJa">{(field) => <field.TextField label="Tiêu đề (Nhật)" />}</form.AppField>
            <form.AppField name="titleEn">{(field) => <field.TextField label="Tiêu đề (Anh)" />}</form.AppField>
            <form.AppField name="seoTitleJa">{(field) => <field.TextField label="Tiêu đề SEO (Nhật)" />}</form.AppField>
            <form.AppField name="seoTitleEn">{(field) => <field.TextField label="Tiêu đề SEO (Anh)" />}</form.AppField>
            <form.AppField name="seoDescriptionJa">{(field) => <field.TextareaField label="Mô tả SEO (Nhật)" rows={2} />}</form.AppField>
            <form.AppField name="seoDescriptionEn">{(field) => <field.TextareaField label="Mô tả SEO (Anh)" rows={2} />}</form.AppField>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Nội dung bài viết</CardTitle>
            <CardDescription>Ảnh bìa và tóm tắt nằm trong phần thông tin đầu bài; các khối dưới đây là nội dung hiển thị trên website.</CardDescription>
          </CardHeader>
          <CardContent>
            <form.Field name="content" validators={{ onSubmit: ({ value }) => validateBlogContent(value, registry.data) }}>
              {(field) => (
                <div className="grid gap-2">
                  <QueryState query={registry}>{(data) => <ContentEditor value={field.state.value} onChange={field.handleChange} profile="MILI_TALK_ARTICLE" registry={data} readOnly={readOnly} />}</QueryState>
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
