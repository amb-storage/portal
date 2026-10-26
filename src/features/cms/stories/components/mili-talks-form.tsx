import type { ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowDown, ArrowUp, Plus, Sparkles, Trash2, Zap } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmButton } from '@/components/common/confirm-button'
import { miliTalksTemplateValues, type MiliTalksForm } from '../hooks/use-mili-talks-form'
import { storyListQuery } from '../queries'

interface MiliTalksFormProps {
  form: MiliTalksForm
  readOnly: boolean
  /** The saved draft has no structured layout yet: fields hold the amb-storage.com template. */
  fromTemplate: boolean
}

function Section({ title, description, actions, children }: { title: string; description?: ReactNode; actions?: ReactNode; children: ReactNode }) {
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

function GroupLabel({ icon, title, hint }: { icon: ReactNode; title: string; hint: string }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <span className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground">{icon}</span>
      <div className="grid">
        <span className="text-sm font-semibold">{title}</span>
        <span className="text-xs text-muted-foreground">{hint}</span>
      </div>
    </div>
  )
}

/**
 * Blog home editor. The hand-written, rarely changed parts (intro, Special Thanks) come first;
 * the article list below fills itself from published Mili Talks.
 */
export function MiliTalksContentForm({ form, readOnly, fromTemplate }: MiliTalksFormProps) {
  const stories = useQuery(storyListQuery({ page: 1, limit: 100, status: 'PUBLISHED' }))
  const storyOptions = (stories.data?.items ?? []).map((story) => ({
    value: story.id,
    label: story.published?.titleJa || story.published?.titleEn || story.slug,
  }))

  const loadTemplate = () => {
    const template = miliTalksTemplateValues()
    for (const key of Object.keys(template) as Array<keyof typeof template>) form.setFieldValue(key, template[key] as never)
  }

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
          <AlertTitle>Đã điền sẵn nội dung theo amb-storage.com/s/stories</AlertTitle>
          <AlertDescription>Kiểm tra lại (phần tiếng Anh là bản dịch) rồi bấm “Lưu nháp” và “Xuất bản” để áp dụng lên website.</AlertDescription>
        </Alert>
      ) : null}

      <fieldset disabled={readOnly} className="grid gap-6">
        <GroupLabel icon={<Sparkles className="size-4" />} title="Phần cố định" hint="Ít khi thay đổi: sửa một lần, hiện ở đầu trang Mili Talks." />

        <Section
          title="Giới thiệu Mili Talks"
          description="Tiêu đề lớn và đoạn giới thiệu ở đầu trang blog."
          actions={
            readOnly ? null : (
              <ConfirmButton
                type="button"
                variant="outline"
                size="sm"
                title="Điền lại nội dung mẫu?"
                description="Giới thiệu và Special Thanks sẽ được thay bằng nội dung theo amb-storage.com/s/stories. Chỉ lưu khi bạn bấm “Lưu nháp”."
                confirmLabel="Điền nội dung mẫu"
                onConfirm={loadTemplate}
              >
                <Sparkles /> Nội dung mẫu
              </ConfirmButton>
            )
          }
        >
          <div className="grid gap-4 md:grid-cols-2">
            <form.AppField name="intro.headingJa">{(field) => <field.TextField label="Tiêu đề (Nhật)" />}</form.AppField>
            <form.AppField name="intro.headingEn">{(field) => <field.TextField label="Tiêu đề (Anh)" />}</form.AppField>
            <form.AppField name="intro.introductionJa">{(field) => <field.TextareaField label="Đoạn giới thiệu (Nhật)" rows={8} description="Xuống dòng trống để tách đoạn" />}</form.AppField>
            <form.AppField name="intro.introductionEn">{(field) => <field.TextareaField label="Đoạn giới thiệu (Anh)" rows={8} />}</form.AppField>
          </div>
        </Section>

        <Section
          title="Special Thanks"
          description="Đoạn ghi chú nguồn và các cột cảm ơn (website, thương hiệu/cửa hàng, nhà sưu tầm), hiện ngay dưới phần giới thiệu."
          actions={<form.AppField name="referencesEnabled">{(field) => <field.SwitchField label="Hiện trên website" />}</form.AppField>}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <form.AppField name="intro.supportingTextJa">{(field) => <field.TextareaField label="Ghi chú nguồn (Nhật)" rows={6} description="Không bắt buộc. Xuống dòng trống để tách đoạn" />}</form.AppField>
            <form.AppField name="intro.supportingTextEn">{(field) => <field.TextareaField label="Ghi chú nguồn (Anh)" rows={6} />}</form.AppField>
          </div>

          <form.Field name="references" mode="array">
            {(groups) => (
              <div className="grid gap-3">
                <div className="grid gap-3 lg:grid-cols-3">
                  {groups.state.value.map((group, index) => (
                    <div key={group.id} className="grid min-w-0 content-start gap-3 rounded-lg border p-3">
                      <div className="flex items-center justify-between text-sm font-medium text-muted-foreground">
                        Cột {index + 1}
                        {readOnly ? null : (
                          <div className="flex gap-1">
                            <Button type="button" size="icon" variant="ghost" aria-label="Sang trái" disabled={index === 0} onClick={() => groups.moveValue(index, index - 1)}>
                              <ArrowUp className="-rotate-90" />
                            </Button>
                            <Button type="button" size="icon" variant="ghost" aria-label="Sang phải" disabled={index === groups.state.value.length - 1} onClick={() => groups.moveValue(index, index + 1)}>
                              <ArrowDown className="-rotate-90" />
                            </Button>
                            <Button type="button" size="icon" variant="ghost" aria-label="Xoá cột" onClick={() => groups.removeValue(index)}>
                              <Trash2 />
                            </Button>
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <form.AppField name={`references[${index}].titleJa`}>{(field) => <field.TextField label="Tiêu đề (Nhật)" />}</form.AppField>
                        <form.AppField name={`references[${index}].titleEn`}>{(field) => <field.TextField label="Tiêu đề (Anh)" />}</form.AppField>
                      </div>
                      <form.AppField name={`references[${index}].itemsJa`}>{(field) => <field.TextareaField label="Danh sách tên" rows={8} description="Mỗi dòng một tên" />}</form.AppField>
                      <form.AppField name={`references[${index}].itemsEn`}>
                        {(field) => <field.TextareaField label="Tên tiếng Anh (nếu khác)" rows={3} description="Để trống nếu giống bên trên" />}
                      </form.AppField>
                    </div>
                  ))}
                </div>
                {readOnly ? null : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="justify-self-start"
                    disabled={groups.state.value.length >= 12}
                    onClick={() => groups.pushValue({ id: crypto.randomUUID(), titleJa: '', titleEn: '', itemsJa: '', itemsEn: '' })}
                  >
                    <Plus /> Thêm cột
                  </Button>
                )}
              </div>
            )}
          </form.Field>
        </Section>

        <GroupLabel icon={<Zap className="size-4" />} title="Phần tự động" hint="Bài viết tự cập nhật khi bạn xuất bản bài mới ở Mili Talks → Bài viết." />

        <Section title="Bài nổi bật" description="Một bài hiện ảnh lớn ngay dưới phần giới thiệu. Không bắt buộc.">
          <form.AppField name="featuredTalkId">
            {(field) => (
              <field.SelectField
                label="Chọn bài"
                options={storyOptions}
                allowEmpty
                placeholder={stories.isPending ? 'Đang tải…' : storyOptions.length ? 'Không có bài nổi bật' : 'Chưa có bài nào đã xuất bản'}
              />
            )}
          </form.AppField>
        </Section>

        <Section title="Danh sách bài" description="Lưới bài viết bên dưới trang. Mặc định tự lấy các bài mới nhất.">
          <div className="grid gap-4 md:grid-cols-2">
            <form.AppField name="grid.titleJa">{(field) => <field.TextField label="Tiêu đề (Nhật)" />}</form.AppField>
            <form.AppField name="grid.titleEn">{(field) => <field.TextField label="Tiêu đề (Anh)" />}</form.AppField>
            <form.AppField name="grid.descriptionJa">{(field) => <field.TextareaField label="Mô tả ngắn (Nhật)" rows={2} description="Không bắt buộc" />}</form.AppField>
            <form.AppField name="grid.descriptionEn">{(field) => <field.TextareaField label="Mô tả ngắn (Anh)" rows={2} />}</form.AppField>
            <form.AppField name="grid.source">
              {(field) => (
                <field.SelectField
                  label="Lấy bài"
                  options={[
                    { value: 'NEWEST', label: 'Tự động: bài mới nhất' },
                    { value: 'MANUAL', label: 'Tự chọn bài' },
                  ]}
                />
              )}
            </form.AppField>
            <form.AppField name="grid.limit">{(field) => <field.NumberField label="Số bài tối đa" min={1} step={1} description="Từ 1 đến 24" />}</form.AppField>
          </div>
          <form.Subscribe selector={(state) => state.values.grid.source}>
            {(source) =>
              source === 'MANUAL' ? (
                <form.AppField name="grid.talkIds">{(field) => <field.MultiSelectField label="Các bài hiển thị" options={storyOptions} placeholder="Chọn bài đã xuất bản" />}</form.AppField>
              ) : null
            }
          </form.Subscribe>
        </Section>

        <details className="rounded-lg border bg-card p-4">
          <summary className="cursor-pointer text-sm font-medium">Tiêu đề trang và SEO (tuỳ chọn)</summary>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <form.AppField name="titleJa">{(field) => <field.TextField label="Tiêu đề trang (Nhật)" />}</form.AppField>
            <form.AppField name="titleEn">{(field) => <field.TextField label="Tiêu đề trang (Anh)" />}</form.AppField>
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
            <form.SubmitButton requireDirty={!fromTemplate}>Lưu nháp</form.SubmitButton>
          </form.StickySaveBar>
        </form.AppForm>
      )}
    </form>
  )
}
