import { ArrowDown, ArrowUp, Plus, Sparkles, Trash2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmButton } from '@/components/common/confirm-button'
import { emptyPolicyDetail, emptyPolicySection, toSectionValues, type PolicyForm } from '../hooks/use-policy-form'
import { policyTemplateContent, type PolicyPageTemplate } from '../policy-template'
import { policySectionDomId, useScrollToHash } from '../scroll'
import { BackToToc, SectionToc } from './section-toc'

interface PolicyFormProps {
  form: PolicyForm
  readOnly: boolean
  /** Starter content for this slug (amb-storage.com/policy), if any. */
  template: PolicyPageTemplate | undefined
  /** The saved draft is not structured yet, so the fields hold the template (or one empty section). */
  unstructured: boolean
}

const BLOCKS_HINT = 'Mỗi đoạn cách nhau một dòng trống'
const LINES_HINT = 'Mỗi dòng là một gạch đầu dòng'

function MoveButtons({ index, length, onMove, onRemove, removeLabel, canRemove = true }: { index: number; length: number; onMove: (from: number, to: number) => void; onRemove: () => void; removeLabel: string; canRemove?: boolean }) {
  return (
    <div className="flex gap-1">
      <Button type="button" size="icon" variant="ghost" aria-label="Lên" disabled={index === 0} onClick={() => onMove(index, index - 1)}>
        <ArrowUp />
      </Button>
      <Button type="button" size="icon" variant="ghost" aria-label="Xuống" disabled={index === length - 1} onClick={() => onMove(index, index + 1)}>
        <ArrowDown />
      </Button>
      <Button type="button" size="icon" variant="ghost" aria-label={removeLabel} disabled={!canRemove} onClick={onRemove}>
        <Trash2 />
      </Button>
    </div>
  )
}

/** Structured Policy editor: sections rendered as-is on the website's /policy page (menu built from section titles). */
export function PolicyContentForm({ form, readOnly, template, unstructured }: PolicyFormProps) {
  useScrollToHash()
  const loadTemplate = () => {
    if (!template) return
    form.setFieldValue('titleJa', template.titleJa)
    form.setFieldValue('titleEn', template.titleEn)
    form.setFieldValue('sections', toSectionValues(policyTemplateContent(template)))
  }

  const pair = (base: string, kind: 'paragraphs' | 'bullets' | 'notes', label: string) => {
    const hint = kind === 'bullets' ? LINES_HINT : BLOCKS_HINT
    return (
      <div className="grid gap-3 md:grid-cols-2">
        <form.AppField name={`${base}.${kind}Ja` as never}>{(field) => <field.TextareaField label={`${label} (Nhật)`} description={hint} rows={kind === 'bullets' ? 4 : 6} />}</form.AppField>
        <form.AppField name={`${base}.${kind}En` as never}>{(field) => <field.TextareaField label={`${label} (Anh)`} description="Cùng số mục và cùng thứ tự với tiếng Nhật" rows={kind === 'bullets' ? 4 : 6} />}</form.AppField>
      </div>
    )
  }

  return (
    <form
      className="grid gap-6"
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      {unstructured ? (
        <Alert>
          <Sparkles />
          <AlertTitle>{template ? 'Đã điền sẵn nội dung theo amb-storage.com/policy' : 'Chính sách chưa dùng bố cục theo mục'}</AlertTitle>
          <AlertDescription>
            {template
              ? 'Kiểm tra lại nội dung (phần tiếng Anh là bản dịch) và ngày hiệu lực rồi bấm “Lưu nội dung” để áp dụng.'
              : 'Thêm các mục bên dưới rồi bấm “Lưu nội dung”. Nội dung dạng một khối văn bản trước đó (nếu có) sẽ được thay thế.'}
          </AlertDescription>
        </Alert>
      ) : null}

      <fieldset disabled={readOnly} className="grid gap-6">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div className="grid gap-1">
              <CardTitle>Thông tin chung</CardTitle>
              <CardDescription>Website gộp mọi chính sách đã xuất bản vào trang /policy, sắp theo slug (A→Z); mục lục lấy từ tiêu đề từng mục.</CardDescription>
            </div>
            {template && !readOnly ? (
              <ConfirmButton
                type="button"
                variant="outline"
                size="sm"
                title="Điền lại nội dung mẫu?"
                description="Tiêu đề và toàn bộ các mục sẽ được thay bằng nội dung theo amb-storage.com/policy. Thay đổi chỉ được lưu khi bạn bấm “Lưu nội dung”."
                confirmLabel="Điền nội dung mẫu"
                onConfirm={loadTemplate}
              >
                <Sparkles /> Nội dung mẫu
              </ConfirmButton>
            ) : null}
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <form.AppField name="titleJa">{(field) => <field.TextField label="Tiêu đề (Nhật)" description="Bắt buộc khi xuất bản" />}</form.AppField>
            <form.AppField name="titleEn">{(field) => <field.TextField label="Tiêu đề (Anh)" description="Bắt buộc khi xuất bản" />}</form.AppField>
            <form.AppField name="effectiveDate">{(field) => <field.TextField label="Ngày hiệu lực" type="date" description="Bắt buộc khi xuất bản" />}</form.AppField>
          </CardContent>
        </Card>

        <form.Subscribe selector={(state) => state.values.sections.map((section) => ({ id: policySectionDomId(section.anchorKey), label: section.titleJa }))}>
          {(items) => <SectionToc items={items} />}
        </form.Subscribe>

        <form.Field name="sections" mode="array">
          {(sections) => (
            <div className="grid gap-6">
              {sections.state.value.map((section, index) => {
                const base = `sections[${index}]`
                return (
                  <Card key={section.id} id={policySectionDomId(section.anchorKey)} className="scroll-mt-40">
                    <CardHeader className="flex flex-row items-center justify-between gap-4">
                      <CardTitle>
                        Mục {index + 1}
                        {section.titleJa ? <span className="font-normal text-muted-foreground"> · {section.titleJa}</span> : null}
                      </CardTitle>
                      <div className="flex items-center gap-1">
                        <BackToToc />
                        {readOnly ? null : (
                          <MoveButtons
                            index={index}
                            length={sections.state.value.length}
                            onMove={sections.moveValue}
                            onRemove={() => sections.removeValue(index)}
                            removeLabel="Xoá mục"
                            canRemove={sections.state.value.length > 1}
                          />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                      <div className="grid gap-3 md:grid-cols-3">
                        <form.AppField name={`sections[${index}].titleJa`}>{(field) => <field.TextField label="Tiêu đề mục (Nhật)" />}</form.AppField>
                        <form.AppField name={`sections[${index}].titleEn`}>{(field) => <field.TextField label="Tiêu đề mục (Anh)" />}</form.AppField>
                        <form.AppField name={`sections[${index}].anchorKey`}>{(field) => <field.TextField label="Anchor" description="Phần sau dấu # trên link (vd. privacy)" />}</form.AppField>
                      </div>
                      {pair(base, 'paragraphs', 'Đoạn văn')}
                      {pair(base, 'bullets', 'Gạch đầu dòng')}

                      <form.Field name={`sections[${index}].details`} mode="array">
                        {(details) => (
                          <div className="grid gap-3">
                            {details.state.value.map((detail, detailIndex) => {
                              const detailBase = `${base}.details[${detailIndex}]`
                              return (
                                <div key={detail.id} className="grid gap-3 rounded-lg border bg-muted/30 p-3">
                                  <div className="flex items-center justify-between text-sm font-medium text-muted-foreground">
                                    Khối chi tiết {detailIndex + 1}
                                    {readOnly ? null : (
                                      <MoveButtons
                                        index={detailIndex}
                                        length={details.state.value.length}
                                        onMove={details.moveValue}
                                        onRemove={() => details.removeValue(detailIndex)}
                                        removeLabel="Xoá khối chi tiết"
                                      />
                                    )}
                                  </div>
                                  <div className="grid gap-3 md:grid-cols-2">
                                    <form.AppField name={`sections[${index}].details[${detailIndex}].titleJa`}>
                                      {(field) => <field.TextField label="Tiêu đề phụ (Nhật)" description="Tuỳ chọn" />}
                                    </form.AppField>
                                    <form.AppField name={`sections[${index}].details[${detailIndex}].titleEn`}>{(field) => <field.TextField label="Tiêu đề phụ (Anh)" />}</form.AppField>
                                  </div>
                                  {pair(detailBase, 'paragraphs', 'Đoạn văn')}
                                  {pair(detailBase, 'bullets', 'Gạch đầu dòng')}
                                </div>
                              )
                            })}
                            {readOnly ? null : (
                              <Button type="button" variant="outline" size="sm" className="justify-self-start" disabled={details.state.value.length >= 48} onClick={() => details.pushValue(emptyPolicyDetail())}>
                                <Plus /> Thêm khối chi tiết (tiêu đề phụ + nội dung)
                              </Button>
                            )}
                          </div>
                        )}
                      </form.Field>

                      {pair(base, 'notes', 'Ghi chú cuối mục')}
                    </CardContent>
                  </Card>
                )
              })}
              {readOnly ? null : (
                <Button type="button" variant="outline" className="justify-self-start" disabled={sections.state.value.length >= 50} onClick={() => sections.pushValue(emptyPolicySection())}>
                  <Plus /> Thêm mục
                </Button>
              )}
            </div>
          )}
        </form.Field>

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
            <form.SubmitButton requireDirty={!(unstructured && template)}>Lưu nội dung</form.SubmitButton>
          </form.StickySaveBar>
        </form.AppForm>
      )}
    </form>
  )
}
