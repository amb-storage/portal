import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { ConfirmButton } from '@/components/common/confirm-button'
import { PageHeader } from '@/components/common/page-header'
import { ErrorAlert, LoadingBlock } from '@/components/common/query-state'
import { StatusBadge } from '@/components/common/status-badge'
import { useCan } from '@/features/auth/hooks/use-permission'
import { ReferencePicker } from '@/features/cms/editor/reference-picker'
import { cmsPageService } from '@/features/cms/pages/cms-page.service'
import { cmsPageKeys, pageDetailQuery, pageDraftQuery, pageListQuery } from '@/features/cms/pages/queries'
import type { PageVersion } from '@/features/cms/pages/types'
import { describeError } from '@/lib/api/errors'
import { PERMISSIONS } from '@/lib/permissions'
import { emptyVoice, isStructuredHome, useCustomerVoiceForm } from '../hooks/use-customer-voice-form'

function CustomerVoiceEditor({ pageId, draft, readOnly }: { pageId: string; draft: PageVersion; readOnly: boolean }) {
  const form = useCustomerVoiceForm(pageId, draft)
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
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div className="grid gap-1">
              <CardTitle>Đánh giá của khách</CardTitle>
              <CardDescription>Mỗi thẻ trên website gồm tên khách, ảnh sản phẩm khách đã mua (bấm vào để xem sản phẩm) và câu đánh giá.</CardDescription>
            </div>
            <form.AppField name="enabled">{(field) => <field.SwitchField label="Hiện trên website" />}</form.AppField>
          </CardHeader>
          <CardContent>
            <form.Field name="items" mode="array">
              {(items) => (
                <div className="grid gap-4">
                  {items.state.value.map((item, index) => (
                    <div key={item.id} className="grid gap-3 rounded-lg border p-4">
                      <div className="flex items-center justify-between text-sm font-medium text-muted-foreground">
                        Đánh giá {index + 1}
                        {readOnly ? null : (
                          <div className="flex gap-1">
                            <Button type="button" size="icon" variant="ghost" aria-label="Lên" disabled={index === 0} onClick={() => items.moveValue(index, index - 1)}>
                              <ArrowUp />
                            </Button>
                            <Button type="button" size="icon" variant="ghost" aria-label="Xuống" disabled={index === items.state.value.length - 1} onClick={() => items.moveValue(index, index + 1)}>
                              <ArrowDown />
                            </Button>
                            <Button type="button" size="icon" variant="ghost" aria-label="Xoá đánh giá" disabled={items.state.value.length <= 1} onClick={() => items.removeValue(index)}>
                              <Trash2 />
                            </Button>
                          </div>
                        )}
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        <form.AppField name={`items[${index}].nameJa`}>{(field) => <field.TextField label="Tên khách (Nhật)" placeholder="T.K 様" description="Không bắt buộc" />}</form.AppField>
                        <form.AppField name={`items[${index}].nameEn`}>{(field) => <field.TextField label="Tên khách (Anh)" placeholder="T.K" />}</form.AppField>
                        <form.AppField name={`items[${index}].quoteJa`}>{(field) => <field.TextareaField label="Đánh giá (Nhật)" rows={4} />}</form.AppField>
                        <form.AppField name={`items[${index}].quoteEn`}>{(field) => <field.TextareaField label="Đánh giá (Anh)" rows={4} />}</form.AppField>
                      </div>
                      <form.Field name={`items[${index}].productId`}>
                        {(field) => (
                          <div className="grid gap-1.5">
                            <Label>Sản phẩm khách đã mua</Label>
                            <ReferencePicker
                              kind="product"
                              multiple={false}
                              value={field.state.value ? [field.state.value] : []}
                              onChange={(ids) => field.handleChange(ids[0] ?? '')}
                              readOnly={readOnly}
                            />
                            {field.form.state.submissionAttempts > 0 && field.state.meta.errors.length ? (
                              <p className="text-xs text-destructive">{String((field.state.meta.errors[0] as { message?: string })?.message ?? field.state.meta.errors[0])}</p>
                            ) : (
                              <p className="text-xs text-muted-foreground">Ảnh đầu tiên của sản phẩm là hình của thẻ. Sản phẩm không có ảnh thì thẻ không hiện.</p>
                            )}
                          </div>
                        )}
                      </form.Field>
                    </div>
                  ))}
                  {readOnly ? null : (
                    <Button type="button" variant="outline" className="justify-self-start" disabled={items.state.value.length >= 48} onClick={() => items.pushValue(emptyVoice())}>
                      <Plus /> Thêm đánh giá
                    </Button>
                  )}
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

/** Customer Voice on the website's home page: one slot of the HOME page, edited without JSON. */
export function CustomerVoicePage() {
  const canEdit = useCan(PERMISSIONS.pageEdit)
  const canPublish = useCan(PERMISSIONS.pagePublish)
  const queryClient = useQueryClient()
  const homes = useQuery(pageListQuery({ page: 1, limit: 1, type: 'HOME', status: 'ACTIVE' }))
  const homeId = homes.data?.items[0]?.id
  const detail = useQuery({ ...pageDetailQuery(homeId ?? ''), enabled: Boolean(homeId) })
  const draft = useQuery({ ...pageDraftQuery(homeId ?? ''), enabled: Boolean(homeId) })

  const publish = useMutation({
    mutationFn: async () => {
      // Publish is CAS-guarded: always send the latest draft identity.
      const current = await queryClient.fetchQuery({ ...pageDraftQuery(homeId!), staleTime: 0 })
      return cmsPageService.publish(homeId!, { draftVersionId: current.id, expectedRevision: current.revision })
    },
    onSuccess: async () => {
      toast.success('Đã xuất bản trang chủ')
      await queryClient.invalidateQueries({ queryKey: cmsPageKeys.all })
    },
    onError: (error) => toast.error(describeError(error)),
  })

  const error = homes.error ?? detail.error ?? draft.error
  return (
    <>
      <PageHeader
        title={
          <span className="flex items-center gap-3">
            Customer Voice {detail.data?.publishedVersionId ? <StatusBadge status="PUBLISHED" /> : null}
          </span>
        }
        description="Đánh giá của khách hiện ở trang chủ website."
        actions={
          canPublish && homeId && draft.data && isStructuredHome(draft.data) ? (
            <ConfirmButton
              disabled={publish.isPending}
              title="Xuất bản trang chủ?"
              description="Bản nháp hiện tại của trang chủ (gồm Customer Voice và mọi thay đổi khác đã lưu ở trang chủ) sẽ lên website."
              confirmLabel="Xuất bản"
              onConfirm={() => publish.mutate()}
            >
              Xuất bản
            </ConfirmButton>
          ) : null
        }
      />
      <ErrorAlert error={error} />
      {homes.isPending || (homeId && draft.isPending) ? (
        <LoadingBlock />
      ) : !homeId ? (
        <p className="rounded-lg border border-dashed p-12 text-center text-sm text-muted-foreground">Chưa có trang chủ (slug home). Trang này được tạo khi khởi tạo CMS ở backend.</p>
      ) : draft.data && !isStructuredHome(draft.data) ? (
        <p className="rounded-lg border border-dashed p-12 text-center text-sm text-muted-foreground">
          Trang chủ đang dùng định dạng cũ nên chưa sửa Customer Voice ở đây được. Liên hệ kỹ thuật để chuyển trang chủ sang định dạng mới.
        </p>
      ) : draft.data ? (
        <CustomerVoiceEditor key={`${draft.data.id}:${draft.data.revision}`} pageId={homeId} draft={draft.data} readOnly={!canEdit} />
      ) : null}
    </>
  )
}
