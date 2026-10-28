import type { ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { ConfirmButton } from '@/components/common/confirm-button'
import { PageHeader } from '@/components/common/page-header'
import { ErrorAlert, LoadingBlock } from '@/components/common/query-state'
import { StatusBadge } from '@/components/common/status-badge'
import { useCan } from '@/features/auth/hooks/use-permission'
import { categoryListQuery } from '@/features/catalog/categories/queries'
import { MediaSetting } from '@/features/cms/editor/media-setting'
import { ReferencePicker } from '@/features/cms/editor/reference-picker'
import { cmsPageService } from '@/features/cms/pages/cms-page.service'
import { cmsPageKeys, pageDetailQuery, pageDraftQuery, pageListQuery } from '@/features/cms/pages/queries'
import type { PageVersion } from '@/features/cms/pages/types'
import { describeError } from '@/lib/api/errors'
import { PERMISSIONS } from '@/lib/permissions'
import { emptyVoice, homeNeedsTitles, isHomePublishable, isStructuredHome, useHomeForm, type HomeForm } from '../hooks/use-home-form'
import { scrollToId, useScrollToHash } from '@/features/cms/pages/scroll'

const errorText = (errors: unknown[]) => {
  const first = errors[0] as { message?: string } | string | undefined
  return typeof first === 'string' ? first : first?.message
}

function Section({ id, title, description, toggle, children }: { id: string; title: string; description: string; toggle?: ReactNode; children: ReactNode }) {
  return (
    <Card id={id} className="scroll-mt-40">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="grid gap-1">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        {toggle}
      </CardHeader>
      <CardContent className="grid gap-4">{children}</CardContent>
    </Card>
  )
}

/** Product / story id picker bound to a form field, with its validation message underneath. */
function PickerField({ form, name, kind, multiple, label, hint, readOnly }: { form: HomeForm; name: string; kind: 'product' | 'story'; multiple: boolean; label: string; hint?: string; readOnly: boolean }) {
  return (
    <form.Field name={name as never}>
      {(field) => {
        const value = field.state.value as unknown as string[] | string
        const ids = Array.isArray(value) ? value : value ? [value] : []
        const error = field.form.state.submissionAttempts > 0 ? errorText(field.state.meta.errors) : undefined
        return (
          <div className="grid gap-1.5">
            <Label>{label}</Label>
            <ReferencePicker kind={kind} multiple={multiple} value={ids} readOnly={readOnly} onChange={(next) => field.handleChange((multiple ? next : (next[0] ?? '')) as never)} />
            {error ? <p className="text-xs text-destructive">{error}</p> : hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
          </div>
        )
      }}
    </form.Field>
  )
}

function HeroSide({ form, side, readOnly, categories }: { form: HomeForm; side: 'left' | 'right'; readOnly: boolean; categories: Array<{ id: string; slug: string; label: string }> }) {
  const base = `hero.${side}` as const
  return (
    <div className="grid content-start gap-3 rounded-lg border p-3">
      <span className="text-sm font-medium text-muted-foreground">{side === 'left' ? 'Bên trái' : 'Bên phải'}</span>
      <form.AppField
        name={`${base}.categoryId`}
        listeners={{
          onChange: ({ value }) => {
            // Suggest the matching Shop filter link until the Admin types their own.
            const slug = categories.find((category) => category.id === value)?.slug
            if (slug && !form.getFieldValue(`${base}.href`)) form.setFieldValue(`${base}.href`, `/shop?category=${slug}`)
          },
        }}
      >
        {(field) => <field.SelectField label="Danh mục" options={categories.map((category) => ({ value: category.id, label: category.label }))} placeholder="Chọn danh mục" />}
      </form.AppField>
      <form.Field name={`${base}.mediaId`}>
        {(field) => (
          <div className="grid gap-1.5">
            <Label>Ảnh</Label>
            <MediaSetting value={field.state.value ? [field.state.value] : []} multiple={false} readOnly={readOnly} onChange={(next) => field.handleChange(next[0] ?? '')} />
            {field.form.state.submissionAttempts > 0 && field.state.meta.errors.length ? <p className="text-xs text-destructive">{errorText(field.state.meta.errors)}</p> : null}
          </div>
        )}
      </form.Field>
      <div className="grid grid-cols-2 gap-2">
        <form.AppField name={`${base}.labelJa`}>{(field) => <field.TextField label="Chữ trên ảnh (Nhật)" />}</form.AppField>
        <form.AppField name={`${base}.labelEn`}>{(field) => <field.TextField label="Chữ trên ảnh (Anh)" />}</form.AppField>
      </div>
      <form.AppField name={`${base}.href`}>{(field) => <field.TextField label="Bấm vào thì mở" description="Tự điền theo danh mục, vd. /shop?category=jackets" />}</form.AppField>
    </div>
  )
}

const TOC = [
  { id: 'home-title', label: 'Tiêu đề & SEO' },
  { id: 'home-hero', label: 'Hero 2 danh mục' },
  { id: 'home-special', label: 'Special Vintage' },
  { id: 'home-new', label: 'New Arrivals' },
  { id: 'home-popular', label: 'Most Popular' },
  { id: 'customer-voice', label: 'Customer Voice' },
  { id: 'home-talks', label: 'Mili Talks' },
]

function HomeEditor({ pageId, draft, readOnly }: { pageId: string; draft: PageVersion; readOnly: boolean }) {
  useScrollToHash()
  const form = useHomeForm(pageId, draft)
  const legacy = !isStructuredHome(draft)
  // Unsaved suggested titles still have to be saved once before publishing.
  const mustSave = legacy || homeNeedsTitles(draft)
  const categories = useQuery(categoryListQuery({ page: 1, limit: 100 }))
  const categoryOptions = (categories.data?.items ?? []).map((category) => ({ id: category.id, slug: category.slug, label: `${category.name_ja} · ${category.name_en}` }))
  const toggle = (name: string) => <form.AppField name={name as never}>{(field) => <field.SwitchField label="Hiện trên website" />}</form.AppField>

  return (
    <form
      className="grid gap-6"
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      {legacy ? (
        <Alert>
          <AlertTriangle />
          <AlertTitle>Trang chủ đang ở định dạng cũ: website chưa đọc được</AlertTitle>
          <AlertDescription>Điền phần Hero 2 danh mục (bắt buộc) và các mục bạn muốn hiện, rồi bấm “Lưu nháp” để chuyển sang định dạng mới, sau đó “Xuất bản”.</AlertDescription>
        </Alert>
      ) : null}

      <nav aria-label="Các mục trang chủ" className="flex flex-wrap gap-2 text-sm">
        {TOC.map((item) => (
          <button key={item.id} type="button" className="rounded-full border px-3 py-1 text-muted-foreground hover:bg-muted hover:text-foreground" onClick={() => scrollToId(item.id)}>
            {item.label}
          </button>
        ))}
      </nav>

      <fieldset disabled={readOnly} className="grid gap-6">
        <Section id="home-title" title="Tiêu đề trang & SEO" description="Tiêu đề Nhật/Anh bắt buộc để xuất bản; hiện trên tab trình duyệt và kết quả Google. SEO không bắt buộc.">
          <div className="grid gap-4 md:grid-cols-2">
            <form.AppField name="titleJa">{(field) => <field.TextField label="Tiêu đề (Nhật)" />}</form.AppField>
            <form.AppField name="titleEn">{(field) => <field.TextField label="Tiêu đề (Anh)" />}</form.AppField>
            <form.AppField name="seoTitleJa">{(field) => <field.TextField label="Tiêu đề SEO (Nhật)" />}</form.AppField>
            <form.AppField name="seoTitleEn">{(field) => <field.TextField label="Tiêu đề SEO (Anh)" />}</form.AppField>
            <form.AppField name="seoDescriptionJa">{(field) => <field.TextareaField label="Mô tả SEO (Nhật)" rows={2} />}</form.AppField>
            <form.AppField name="seoDescriptionEn">{(field) => <field.TextareaField label="Mô tả SEO (Anh)" rows={2} />}</form.AppField>
          </div>
        </Section>

        <Section id="home-hero" title="Hero 2 danh mục" description="Hai ảnh lớn đầu trang chủ, mỗi ảnh dẫn tới một danh mục. Bắt buộc để xuất bản.">
          <div className="grid gap-4 lg:grid-cols-2">
            <HeroSide form={form} side="left" readOnly={readOnly} categories={categoryOptions} />
            <HeroSide form={form} side="right" readOnly={readOnly} categories={categoryOptions} />
          </div>
        </Section>

        <Section id="home-special" title="Special Vintage" description="Dải sản phẩm chọn tay, theo thứ tự bạn chọn." toggle={toggle('specialVintage.enabled')}>
          <PickerField form={form} name="specialVintage.productIds" kind="product" multiple label="Sản phẩm" readOnly={readOnly} />
        </Section>

        <Section id="home-new" title="New Arrivals" description="Tự động lấy các sản phẩm mới nhất đang bán." toggle={toggle('newArrivals.enabled')}>
          <form.AppField name="newArrivals.limit">{(field) => <field.NumberField label="Số sản phẩm" min={1} step={1} description="Từ 1 đến 24" />}</form.AppField>
        </Section>

        <Section id="home-popular" title="Most Popular" description="Dải sản phẩm nổi bật chọn tay." toggle={toggle('mostPopular.enabled')}>
          <PickerField form={form} name="mostPopular.productIds" kind="product" multiple label="Sản phẩm" readOnly={readOnly} />
        </Section>

        <Section id="customer-voice" title="Customer Voice" description="Đánh giá của khách: tên, ảnh sản phẩm khách đã mua (bấm vào để xem sản phẩm) và câu đánh giá." toggle={toggle('customerVoice.enabled')}>
          <form.Field name="customerVoice.items" mode="array">
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
                      <form.AppField name={`customerVoice.items[${index}].nameJa`}>{(field) => <field.TextField label="Tên khách (Nhật)" placeholder="T.K 様" description="Không bắt buộc" />}</form.AppField>
                      <form.AppField name={`customerVoice.items[${index}].nameEn`}>{(field) => <field.TextField label="Tên khách (Anh)" placeholder="T.K" />}</form.AppField>
                      <form.AppField name={`customerVoice.items[${index}].quoteJa`}>{(field) => <field.TextareaField label="Đánh giá (Nhật)" rows={4} />}</form.AppField>
                      <form.AppField name={`customerVoice.items[${index}].quoteEn`}>{(field) => <field.TextareaField label="Đánh giá (Anh)" rows={4} />}</form.AppField>
                    </div>
                    <PickerField
                      form={form}
                      name={`customerVoice.items[${index}].productId`}
                      kind="product"
                      multiple={false}
                      label="Sản phẩm khách đã mua"
                      hint="Ảnh đầu tiên của sản phẩm là hình của thẻ. Sản phẩm không có ảnh thì thẻ không hiện."
                      readOnly={readOnly}
                    />
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
        </Section>

        <Section id="home-talks" title="Mili Talks trên trang chủ" description="Đoạn giới thiệu blog và một hình ở cuối trang chủ; bấm hình sẽ mở trang Mili Talks.">
          <div className="grid gap-3 rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Giới thiệu</span>
              {toggle('talksIntro.enabled')}
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <form.AppField name="talksIntro.headingJa">{(field) => <field.TextField label="Tiêu đề (Nhật)" />}</form.AppField>
              <form.AppField name="talksIntro.headingEn">{(field) => <field.TextField label="Tiêu đề (Anh)" />}</form.AppField>
              <form.AppField name="talksIntro.bodyJa">{(field) => <field.TextareaField label="Đoạn văn (Nhật)" rows={4} />}</form.AppField>
              <form.AppField name="talksIntro.bodyEn">{(field) => <field.TextareaField label="Đoạn văn (Anh)" rows={4} />}</form.AppField>
            </div>
          </div>
          <form.Field name="talksIntro.mediaId">
            {(field) => (
              <div className="grid gap-1.5 rounded-lg border p-3">
                <Label>Hình</Label>
                <MediaSetting value={field.state.value ? [field.state.value] : []} multiple={false} readOnly={readOnly} onChange={(next) => field.handleChange(next[0] ?? '')} />
                <p className="text-xs text-muted-foreground">Hiện cạnh đoạn giới thiệu trên trang chủ; khách bấm vào hình sẽ mở trang Mili Talks (/blog).</p>
              </div>
            )}
          </form.Field>
        </Section>
      </fieldset>

      {readOnly ? null : (
        <form.AppForm>
          <form.StickySaveBar>
            <form.SubmitButton requireDirty={!mustSave}>{legacy ? 'Lưu nháp (chuyển định dạng mới)' : 'Lưu nháp'}</form.SubmitButton>
          </form.StickySaveBar>
        </form.AppForm>
      )}
    </form>
  )
}

/** The website's home page (HOME), edited by slot instead of JSON. */
export function HomePageEditor() {
  const canEdit = useCan(PERMISSIONS.pageEdit)
  const canPublish = useCan(PERMISSIONS.pagePublish)
  const queryClient = useQueryClient()
  const homes = useQuery(pageListQuery({ page: 1, limit: 1, type: 'HOME', status: 'ACTIVE' }))
  const homeId = homes.data?.items[0]?.id
  const detail = useQuery({ ...pageDetailQuery(homeId ?? ''), enabled: Boolean(homeId) })
  const draft = useQuery({ ...pageDraftQuery(homeId ?? ''), enabled: Boolean(homeId) })
  const publishable = draft.data ? isHomePublishable(draft.data) : false

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

  return (
    <>
      <PageHeader
        title={
          <span className="flex items-center gap-3">
            Trang chủ {detail.data?.publishedVersionId ? <StatusBadge status="PUBLISHED" /> : null}
          </span>
        }
        description="Các mục ở trang chủ website. Lưu nháp rồi Xuất bản để cập nhật website."
        actions={
          canPublish && homeId ? (
            <ConfirmButton
              disabled={publish.isPending || !publishable}
              title="Xuất bản trang chủ?"
              description="Bản nháp đã lưu của trang chủ sẽ lên website."
              confirmLabel="Xuất bản"
              onConfirm={() => publish.mutate()}
            >
              {publishable ? 'Xuất bản' : draft.data && homeNeedsTitles(draft.data) ? 'Cần lưu tiêu đề để xuất bản' : 'Cần lưu Hero 2 danh mục để xuất bản'}
            </ConfirmButton>
          ) : null
        }
      />
      <ErrorAlert error={homes.error ?? detail.error ?? draft.error} />
      {homes.isPending || (homeId && draft.isPending) ? (
        <LoadingBlock />
      ) : !homeId ? (
        <p className="rounded-lg border border-dashed p-12 text-center text-sm text-muted-foreground">Chưa có trang chủ (slug home). Trang này được tạo khi khởi tạo CMS ở backend.</p>
      ) : draft.data ? (
        <HomeEditor key={`${draft.data.id}:${draft.data.revision}`} pageId={homeId} draft={draft.data} readOnly={!canEdit} />
      ) : null}
    </>
  )
}
