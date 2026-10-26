import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RichTextEditor } from '@/features/cms/editor/rich-text-editor'
import type { RichNode } from '@/features/cms/editor/types'
import { cn } from '@/lib/utils'
import type { FixedForm, RichDoc } from '../hooks/use-fixed-form'

interface FixedContentFormProps {
  form: FixedForm
  isPolicy: boolean
  readOnly: boolean
}

/** Simple editor for About / Policy pages: titles, (policy) effective date, bilingual body. */
export function FixedContentForm({ form, isPolicy, readOnly }: FixedContentFormProps) {
  const [lang, setLang] = useState<'ja' | 'en'>('ja')
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
            <CardTitle>Tiêu đề</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <form.AppField name="titleJa">{(field) => <field.TextField label="Tiêu đề (Nhật)" />}</form.AppField>
            <form.AppField name="titleEn">{(field) => <field.TextField label="Tiêu đề (Anh)" />}</form.AppField>
            {isPolicy ? (
              <form.AppField name="effectiveDate">
                {(field) => <field.TextField label="Ngày hiệu lực" type="date" description="Bắt buộc trước khi xuất bản" />}
              </form.AppField>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div className="grid gap-1">
              <CardTitle>Nội dung</CardTitle>
              <CardDescription>Cần có nội dung cả tiếng Nhật và tiếng Anh để xuất bản.</CardDescription>
            </div>
            <div className="inline-flex shrink-0 rounded-lg border bg-muted/40 p-0.5 text-sm">
              {(['ja', 'en'] as const).map((value) => (
                <button key={value} type="button" onClick={() => setLang(value)} className={cn('rounded-md px-3 py-1 text-muted-foreground', lang === value && 'bg-background text-foreground shadow-xs')}>
                  {value === 'ja' ? 'Tiếng Nhật' : 'Tiếng Anh'}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            {/* Both editors stay mounted so switching tabs keeps cursor/undo history. */}
            {(['ja', 'en'] as const).map((value) => (
              <div key={value} hidden={lang !== value}>
                <form.Field name={value === 'ja' ? 'bodyJa' : 'bodyEn'}>
                  {(field) => (
                    <RichTextEditor
                      value={field.state.value as unknown as RichNode}
                      onChange={(next) => field.handleChange(next as unknown as RichDoc)}
                      readOnly={readOnly}
                      placeholder={value === 'ja' ? '日本語の本文を入力…' : 'Write the English content…'}
                    />
                  )}
                </form.Field>
              </div>
            ))}
          </CardContent>
        </Card>

        <details className="rounded-lg border bg-card p-4">
          <summary className="cursor-pointer text-sm font-medium">SEO (tuỳ chọn)</summary>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <form.AppField name="seoTitleJa">{(field) => <field.TextField label="Tiêu đề SEO (Nhật)" />}</form.AppField>
            <form.AppField name="seoTitleEn">{(field) => <field.TextField label="Tiêu đề SEO (Anh)" />}</form.AppField>
            <form.AppField name="seoDescriptionJa">{(field) => <field.TextareaField label="Mô tả SEO (Nhật)" rows={2} />}</form.AppField>
            <form.AppField name="seoDescriptionEn">{(field) => <field.TextareaField label="Mô tả SEO (Anh)" rows={2} />}</form.AppField>
          </div>
        </details>
      </fieldset>
      {readOnly ? null : (
        <form.AppForm>
          <form.StickySaveBar>
            <form.SubmitButton requireDirty>Lưu nội dung</form.SubmitButton>
          </form.StickySaveBar>
        </form.AppForm>
      )}
    </form>
  )
}
