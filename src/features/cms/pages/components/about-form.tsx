import { useState, type ReactNode } from 'react'
import { ArrowDown, ArrowUp, Plus, Sparkles, Trash2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { ConfirmButton } from '@/components/common/confirm-button'
import { RichTextEditor } from '@/features/cms/editor/rich-text-editor'
import type { RichNode } from '@/features/cms/editor/types'
import { aboutTemplateValues, type AboutForm } from '../hooks/use-about-form'
import type { RichDoc } from '../hooks/use-fixed-form'

type RichKey = 'philosophy' | 'mission' | 'vision' | 'promise' | 'knowledge' | 'contact'

interface AboutFormProps {
  form: AboutForm
  readOnly: boolean
  /** The saved draft is not structured yet: the fields hold the amb-storage.com template. */
  fromTemplate: boolean
}

function Section({ title, description, actions, children }: { title: string; description?: string; actions?: ReactNode; children: ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="grid gap-1">
          <CardTitle>{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </div>
        {actions}
      </CardHeader>
      <CardContent className="grid gap-4">{children}</CardContent>
    </Card>
  )
}

/** Structured About editor: one card per website section, Japanese and English side by side. */
export function AboutContentForm({ form, readOnly, fromTemplate }: AboutFormProps) {
  // Rich-text editors are uncontrolled after mount; bump to remount them after loading the template.
  const [seed, setSeed] = useState(0)

  const loadTemplate = () => {
    const template = aboutTemplateValues()
    for (const key of Object.keys(template) as Array<keyof typeof template>) form.setFieldValue(key, template[key] as never)
    setSeed((value) => value + 1)
  }

  const rich = (key: RichKey, lang: 'Ja' | 'En') => (
    <form.Field key={`${key}-${lang}-${seed}`} name={`${key}.body${lang}`}>
      {(field) => {
        const showError = field.form.state.submissionAttempts > 0 && field.state.meta.errors.length > 0
        return (
          <div className="grid gap-1.5">
            <Label>{lang === 'Ja' ? 'Nội dung (Nhật)' : 'Nội dung (Anh)'}</Label>
            <div className="rounded-md border">
              <RichTextEditor
                value={field.state.value as unknown as RichNode}
                onChange={(next) => field.handleChange(next as unknown as RichDoc)}
                readOnly={readOnly}
                placeholder={lang === 'Ja' ? '日本語の本文を入力…' : 'Write the English content…'}
              />
            </div>
            {showError ? <p className="text-xs text-destructive">Cần có nội dung</p> : null}
          </div>
        )
      }}
    </form.Field>
  )
  const richPair = (key: RichKey) => (
    <div className="grid gap-4 lg:grid-cols-2">
      {rich(key, 'Ja')}
      {rich(key, 'En')}
    </div>
  )
  const headingPair = (key: 'philosophy' | 'contact') => (
    <div className="grid gap-4 md:grid-cols-2">
      <form.AppField name={`${key}.headingJa`}>{(field) => <field.TextField label="Tiêu đề mục (Nhật)" description="Để trống cả hai để dùng tiêu đề mặc định của website" />}</form.AppField>
      <form.AppField name={`${key}.headingEn`}>{(field) => <field.TextField label="Tiêu đề mục (Anh)" />}</form.AppField>
    </div>
  )

  return (
    <form
      className="grid gap-6"
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      {fromTemplate ? (
        <Alert>
          <Sparkles />
          <AlertTitle>Đã điền sẵn nội dung theo amb-storage.com/about-us</AlertTitle>
          <AlertDescription>
            Trang Giới thiệu chưa dùng bố cục theo mục. Kiểm tra lại nội dung (phần tiếng Anh là bản dịch) rồi bấm “Lưu nội dung” để áp dụng.
          </AlertDescription>
        </Alert>
      ) : null}

      <fieldset disabled={readOnly} className="grid gap-6">
        <Section
          title="Tiêu đề trang"
          actions={
            readOnly ? null : (
              <ConfirmButton
                type="button"
                variant="outline"
                size="sm"
                title="Điền lại nội dung mẫu?"
                description="Toàn bộ các mục bên dưới sẽ được thay bằng nội dung theo amb-storage.com/about-us. Thay đổi chỉ được lưu khi bạn bấm “Lưu nội dung”."
                confirmLabel="Điền nội dung mẫu"
                onConfirm={loadTemplate}
              >
                <Sparkles /> Nội dung mẫu
              </ConfirmButton>
            )
          }
        >
          <div className="grid gap-4 md:grid-cols-2">
            <form.AppField name="titleJa">{(field) => <field.TextField label="Tiêu đề (Nhật)" description="Bắt buộc khi xuất bản" />}</form.AppField>
            <form.AppField name="titleEn">{(field) => <field.TextField label="Tiêu đề (Anh)" description="Bắt buộc khi xuất bản" />}</form.AppField>
          </div>
        </Section>

        <Section title="会社概要 · Thông tin công ty" description="Mỗi dòng gồm nhãn và nội dung; nội dung có thể xuống dòng.">
          <form.Field name="overview" mode="array">
            {(rows) => (
              <div className="grid gap-3">
                {rows.state.value.map((row, index) => (
                  <div key={row.id} className="grid gap-3 rounded-lg border p-3">
                    <div className="flex items-center justify-between text-sm font-medium text-muted-foreground">
                      Dòng {index + 1}
                      {readOnly ? null : (
                        <div className="flex gap-1">
                          <Button type="button" size="icon" variant="ghost" aria-label="Lên" disabled={index === 0} onClick={() => rows.moveValue(index, index - 1)}>
                            <ArrowUp />
                          </Button>
                          <Button type="button" size="icon" variant="ghost" aria-label="Xuống" disabled={index === rows.state.value.length - 1} onClick={() => rows.moveValue(index, index + 1)}>
                            <ArrowDown />
                          </Button>
                          <Button type="button" size="icon" variant="ghost" aria-label="Xoá dòng" onClick={() => rows.removeValue(index)}>
                            <Trash2 />
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <form.AppField name={`overview[${index}].labelJa`}>{(field) => <field.TextField label="Nhãn (Nhật)" placeholder="社名" />}</form.AppField>
                      <form.AppField name={`overview[${index}].labelEn`}>{(field) => <field.TextField label="Nhãn (Anh)" placeholder="Company" />}</form.AppField>
                      <form.AppField name={`overview[${index}].valueJa`}>{(field) => <field.TextareaField label="Nội dung (Nhật)" rows={2} />}</form.AppField>
                      <form.AppField name={`overview[${index}].valueEn`}>{(field) => <field.TextareaField label="Nội dung (Anh)" rows={2} />}</form.AppField>
                    </div>
                  </div>
                ))}
                {readOnly ? null : (
                  <Button
                    type="button"
                    variant="outline"
                    className="justify-self-start"
                    disabled={rows.state.value.length >= 48}
                    onClick={() => rows.pushValue({ id: crypto.randomUUID(), labelJa: '', labelEn: '', valueJa: '', valueEn: '' })}
                  >
                    <Plus /> Thêm dòng
                  </Button>
                )}
              </div>
            )}
          </form.Field>
        </Section>

        <Section title="ブランド理念 · Triết lý thương hiệu">
          {headingPair('philosophy')}
          {richPair('philosophy')}
        </Section>

        <Section title="Mission">{richPair('mission')}</Section>
        <Section title="Vision">{richPair('vision')}</Section>

        <Section title="Core Values" description="Website tự đánh số 1, 2, 3… theo thứ tự bên dưới.">
          <form.Field name="values" mode="array">
            {(items) => (
              <div className="grid gap-3">
                {items.state.value.map((item, index) => (
                  <div key={item.id} className="grid gap-3 rounded-lg border p-3">
                    <div className="flex items-center justify-between text-sm font-medium text-muted-foreground">
                      Giá trị {index + 1}
                      {readOnly ? null : (
                        <div className="flex gap-1">
                          <Button type="button" size="icon" variant="ghost" aria-label="Lên" disabled={index === 0} onClick={() => items.moveValue(index, index - 1)}>
                            <ArrowUp />
                          </Button>
                          <Button type="button" size="icon" variant="ghost" aria-label="Xuống" disabled={index === items.state.value.length - 1} onClick={() => items.moveValue(index, index + 1)}>
                            <ArrowDown />
                          </Button>
                          <Button type="button" size="icon" variant="ghost" aria-label="Xoá giá trị" disabled={items.state.value.length <= 1} onClick={() => items.removeValue(index)}>
                            <Trash2 />
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <form.AppField name={`values[${index}].titleJa`}>{(field) => <field.TextField label="Tên (Nhật)" placeholder="Authenticity（オリジナルへのこだわり）" />}</form.AppField>
                      <form.AppField name={`values[${index}].titleEn`}>{(field) => <field.TextField label="Tên (Anh)" placeholder="Authenticity" />}</form.AppField>
                      <form.AppField name={`values[${index}].bodyJa`}>{(field) => <field.TextareaField label="Mô tả (Nhật)" rows={2} />}</form.AppField>
                      <form.AppField name={`values[${index}].bodyEn`}>{(field) => <field.TextareaField label="Mô tả (Anh)" rows={2} />}</form.AppField>
                    </div>
                  </div>
                ))}
                {readOnly ? null : (
                  <Button
                    type="button"
                    variant="outline"
                    className="justify-self-start"
                    disabled={items.state.value.length >= 48}
                    onClick={() => items.pushValue({ id: crypto.randomUUID(), titleJa: '', titleEn: '', bodyJa: '', bodyEn: '' })}
                  >
                    <Plus /> Thêm giá trị
                  </Button>
                )}
              </div>
            )}
          </form.Field>
        </Section>

        <Section title="Our Promise">{richPair('promise')}</Section>
        <Section title="Knowledge & Community">{richPair('knowledge')}</Section>

        <Section title="お問い合わせ · Liên hệ">
          {headingPair('contact')}
          {richPair('contact')}
        </Section>

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
            <form.SubmitButton requireDirty={!fromTemplate}>Lưu nội dung</form.SubmitButton>
          </form.StickySaveBar>
        </form.AppForm>
      )}
    </form>
  )
}
