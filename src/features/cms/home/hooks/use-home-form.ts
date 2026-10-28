import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { z } from 'zod'
import { useAppForm } from '@/components/form/form-hook'
import { isSafeLink } from '@/features/cms/editor/rich-text'
import { cmsPageService } from '@/features/cms/pages/cms-page.service'
import { cmsPageKeys } from '@/features/cms/pages/queries'
import type { PageVersion } from '@/features/cms/pages/types'
import { describeError } from '@/lib/api/errors'

/*
 * Home page (HOME_BUILDER, schemaVersion 2): one section per slot. The public /home endpoint only
 * reads schemaVersion 2, and publishing needs all seven slots with the hero split enabled; every
 * other slot may be switched off (an off slot is stored with empty settings).
 */

export interface HeroSideValues {
  categoryId: string
  mediaId: string
  labelJa: string
  labelEn: string
  href: string
}

export interface VoiceValues {
  id: string
  nameJa: string
  nameEn: string
  quoteJa: string
  quoteEn: string
  productId: string
}

export interface HomeFormValues {
  /** Publication requires both titles (requireLocalizedTitle on the API). */
  titleJa: string
  titleEn: string
  seoTitleJa: string
  seoTitleEn: string
  seoDescriptionJa: string
  seoDescriptionEn: string
  hero: { left: HeroSideValues; right: HeroSideValues }
  specialVintage: { enabled: boolean; productIds: string[] }
  newArrivals: { enabled: boolean; limit: number }
  mostPopular: { enabled: boolean; productIds: string[] }
  customerVoice: { enabled: boolean; items: VoiceValues[] }
  /** `mediaId`: image beside the intro, linking to /blog on the website ('' = none). */
  talksIntro: { enabled: boolean; headingJa: string; headingEn: string; bodyJa: string; bodyEn: string; mediaId: string }
}

export const HOME_SLOTS = [
  'CATEGORY_HERO_SPLIT',
  'SPECIAL_VINTAGE',
  'NEW_ARRIVALS',
  'MOST_POPULAR',
  'CUSTOMER_VOICE',
  'MILI_TALKS_INTRO',
  'FEATURED_MILI_TALK',
] as const
type Slot = (typeof HOME_SLOTS)[number]
type Section = { id: string; type: string; enabled: boolean; settings: Record<string, unknown> }

const str = (value: unknown) => (typeof value === 'string' ? value : '')
const ids = (value: unknown) => (Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string') : [])

/** Legacy schemaVersion 1 Home drafts are not readable by the website and must be converted. */
export const isStructuredHome = (draft: PageVersion) => (draft.content as { schemaVersion?: number } | undefined)?.schemaVersion === 2

const sectionsOf = (draft: PageVersion): Section[] => {
  const content = draft.content as { schemaVersion?: number; sections?: unknown } | undefined
  return content?.schemaVersion === 2 && Array.isArray(content.sections) ? (content.sections as Section[]) : []
}

export const emptyVoice = (): VoiceValues => ({ id: crypto.randomUUID(), nameJa: '', nameEn: '', quoteJa: '', quoteEn: '', productId: '' })
const emptySide = (): HeroSideValues => ({ categoryId: '', mediaId: '', labelJa: '', labelEn: '', href: '' })

function sideValues(value: unknown): HeroSideValues {
  const side = (value ?? {}) as Record<string, unknown>
  return { categoryId: str(side.categoryId), mediaId: str(side.mediaId), labelJa: str(side.labelJa), labelEn: str(side.labelEn), href: str(side.href) }
}

/** Saved slots, or defaults (a legacy/empty Home starts with everything but the hero switched off). */
function toValues(draft: PageVersion): HomeFormValues {
  const sections = sectionsOf(draft)
  const find = (type: Slot) => sections.find((section) => section.type === type)
  const on = (section: Section | undefined) => Boolean(section?.enabled && Object.keys(section.settings).length > 0)
  const hero = find('CATEGORY_HERO_SPLIT')
  const special = find('SPECIAL_VINTAGE')
  const newest = find('NEW_ARRIVALS')
  const popular = find('MOST_POPULAR')
  const voice = find('CUSTOMER_VOICE')
  const intro = find('MILI_TALKS_INTRO')
  const voiceItems = (voice?.settings.items as Array<Record<string, unknown>> | undefined) ?? []
  return {
    // A Home converted from the legacy format usually has no titles yet: suggest the store name.
    titleJa: draft.titleJa ?? DEFAULT_TITLE,
    titleEn: draft.titleEn ?? DEFAULT_TITLE,
    seoTitleJa: draft.seoTitleJa ?? '',
    seoTitleEn: draft.seoTitleEn ?? '',
    seoDescriptionJa: draft.seoDescriptionJa ?? '',
    seoDescriptionEn: draft.seoDescriptionEn ?? '',
    hero: { left: hero ? sideValues(hero.settings.left) : emptySide(), right: hero ? sideValues(hero.settings.right) : emptySide() },
    specialVintage: { enabled: on(special), productIds: ids(special?.settings.productIds) },
    newArrivals: { enabled: newest ? on(newest) : true, limit: typeof newest?.settings.limit === 'number' ? newest.settings.limit : 12 },
    mostPopular: { enabled: on(popular), productIds: ids(popular?.settings.productIds) },
    customerVoice: {
      enabled: on(voice),
      items: voiceItems.length
        ? voiceItems.map((item) => ({
            id: str(item.id) || crypto.randomUUID(),
            nameJa: str(item.nameJa),
            nameEn: str(item.nameEn),
            quoteJa: str(item.quoteJa),
            quoteEn: str(item.quoteEn),
            productId: str(item.productId),
          }))
        : [emptyVoice()],
    },
    talksIntro: {
      enabled: on(intro),
      headingJa: str(intro?.settings.headingJa),
      headingEn: str(intro?.settings.headingEn),
      bodyJa: str(intro?.settings.bodyJa),
      bodyEn: str(intro?.settings.bodyEn),
      mediaId: str(intro?.settings.mediaId),
    },
  }
}

const DEFAULT_TITLE = 'AMB:STORAGE'

/** The saved draft lacks the Japanese/English titles publication requires. */
export const homeNeedsTitles = (draft: PageVersion) => !draft.titleJa?.trim() || !draft.titleEn?.trim()

const heroComplete = (side: HeroSideValues) => Boolean(side.categoryId && side.mediaId && side.labelJa.trim() && side.labelEn.trim() && side.href.trim())

/** True when the hero split is complete, i.e. the saved Home can be published. */
export const isHomePublishable = (draft: PageVersion) => {
  const values = toValues(draft)
  return isStructuredHome(draft) && !homeNeedsTitles(draft) && sectionsOf(draft).some((section) => section.type === 'CATEGORY_HERO_SPLIT') && heroComplete(values.hero.left) && heroComplete(values.hero.right)
}

function toContent(values: HomeFormValues, draft: PageVersion) {
  const existing = sectionsOf(draft)
  const idOf = (type: Slot) => existing.find((section) => section.type === type)?.id ?? crypto.randomUUID()
  // A switched-off slot is stored with empty settings, which the API accepts without validation.
  const section = (type: Slot, enabled: boolean, settings: Record<string, unknown>) => ({
    id: idOf(type),
    type,
    schemaVersion: 2,
    enabled,
    settings: enabled ? settings : {},
    blocks: [],
  })
  const side = (value: HeroSideValues) => ({
    categoryId: value.categoryId,
    mediaId: value.mediaId,
    labelJa: value.labelJa.trim(),
    labelEn: value.labelEn.trim(),
    href: value.href.trim(),
  })
  const hero = values.hero
  const sections = [
    // The hero is validated even in drafts, so it is only stored once both sides are complete.
    ...(heroComplete(hero.left) && heroComplete(hero.right) ? [section('CATEGORY_HERO_SPLIT', true, { left: side(hero.left), right: side(hero.right) })] : []),
    section('SPECIAL_VINTAGE', values.specialVintage.enabled, { productIds: values.specialVintage.productIds }),
    section('NEW_ARRIVALS', values.newArrivals.enabled, { limit: values.newArrivals.limit }),
    section('MOST_POPULAR', values.mostPopular.enabled, { productIds: values.mostPopular.productIds }),
    section('CUSTOMER_VOICE', values.customerVoice.enabled, {
      items: values.customerVoice.items.map((item) => ({
        id: item.id,
        // Names are optional; the API only accepts them as non-empty strings.
        ...(item.nameJa.trim() ? { nameJa: item.nameJa.trim() } : {}),
        ...(item.nameEn.trim() ? { nameEn: item.nameEn.trim() } : {}),
        quoteJa: item.quoteJa.trim(),
        quoteEn: item.quoteEn.trim(),
        ...(item.productId ? { productId: item.productId } : {}),
      })),
    }),
    section('MILI_TALKS_INTRO', values.talksIntro.enabled, {
      headingJa: values.talksIntro.headingJa.trim(),
      headingEn: values.talksIntro.headingEn.trim(),
      bodyJa: values.talksIntro.bodyJa.trim(),
      bodyEn: values.talksIntro.bodyEn.trim(),
      ...(values.talksIntro.mediaId ? { mediaId: values.talksIntro.mediaId } : {}),
    }),
    // The intro image replaced the featured article; the slot stays (publishing needs it) but off.
    section('FEATURED_MILI_TALK', false, {}),
  ]
  return { schemaVersion: 2, sections }
}

/* Mirrors validateHome / validateHomeSlot so mistakes show next to the field instead of as a 400. */
const issue = (context: z.RefinementCtx, path: (string | number)[], message: string) => context.addIssue({ code: 'custom', path, message })
const schema = z.custom<HomeFormValues>().superRefine((values, context) => {
  if (!values.titleJa.trim()) issue(context, ['titleJa'], 'Bắt buộc để xuất bản')
  if (!values.titleEn.trim()) issue(context, ['titleEn'], 'Bắt buộc để xuất bản')
  const { hero } = values
  const started = [hero.left, hero.right].some((side) => Object.values(side).some((value) => String(value).trim()))
  if (started)
    for (const name of ['left', 'right'] as const) {
      const side = hero[name]
      const path = ['hero', name]
      if (!side.categoryId) issue(context, [...path, 'categoryId'], 'Chọn danh mục')
      if (!side.mediaId) issue(context, [...path, 'mediaId'], 'Chọn ảnh')
      if (!side.labelJa.trim()) issue(context, [...path, 'labelJa'], 'Bắt buộc')
      if (!side.labelEn.trim()) issue(context, [...path, 'labelEn'], 'Bắt buộc')
      if (!isSafeLink(side.href.trim())) issue(context, [...path, 'href'], 'Đường dẫn bắt đầu bằng / (vd. /shop?category=jackets) hoặc https://')
    }
  if (hero.left.categoryId && hero.left.categoryId === hero.right.categoryId) issue(context, ['hero', 'right', 'categoryId'], 'Hai bên phải là hai danh mục khác nhau')
  if (values.specialVintage.enabled && values.specialVintage.productIds.length === 0) issue(context, ['specialVintage', 'productIds'], 'Chọn ít nhất một sản phẩm, hoặc tắt mục này')
  if (values.mostPopular.enabled && values.mostPopular.productIds.length === 0) issue(context, ['mostPopular', 'productIds'], 'Chọn ít nhất một sản phẩm, hoặc tắt mục này')
  if (values.newArrivals.enabled && !(Number.isInteger(values.newArrivals.limit) && values.newArrivals.limit >= 1 && values.newArrivals.limit <= 24))
    issue(context, ['newArrivals', 'limit'], 'Từ 1 đến 24')
  if (values.customerVoice.enabled)
    values.customerVoice.items.forEach((item, index) => {
      if (!item.quoteJa.trim()) issue(context, ['customerVoice', 'items', index, 'quoteJa'], 'Bắt buộc')
      if (!item.quoteEn.trim()) issue(context, ['customerVoice', 'items', index, 'quoteEn'], 'Bắt buộc')
      if (!item.productId) issue(context, ['customerVoice', 'items', index, 'productId'], 'Chọn sản phẩm: website chỉ hiện đánh giá có gắn sản phẩm')
    })
  if (values.talksIntro.enabled)
    for (const key of ['headingJa', 'headingEn', 'bodyJa', 'bodyEn'] as const)
      if (!values.talksIntro[key].trim()) issue(context, ['talksIntro', key], 'Bắt buộc, hoặc tắt mục này')
})

export function useHomeForm(pageId: string, draft: PageVersion) {
  const queryClient = useQueryClient()
  const save = useMutation({
    mutationFn: (values: HomeFormValues) =>
      cmsPageService.updateDraft(pageId, {
        draftVersionId: draft.id,
        expectedRevision: draft.revision,
        titleJa: values.titleJa.trim(),
        titleEn: values.titleEn.trim(),
        seoTitleJa: values.seoTitleJa.trim() || null,
        seoTitleEn: values.seoTitleEn.trim() || null,
        seoDescriptionJa: values.seoDescriptionJa.trim() || null,
        seoDescriptionEn: values.seoDescriptionEn.trim() || null,
        effectiveAt: null,
        content: toContent(values, draft),
      }),
    onSuccess: async (updated) => {
      toast.success('Đã lưu bản nháp trang chủ')
      queryClient.setQueryData(cmsPageKeys.draft(pageId), updated)
      await queryClient.invalidateQueries({ queryKey: cmsPageKeys.detail(pageId) })
    },
    onError: (error) => toast.error(describeError(error)),
  })

  return useAppForm({
    defaultValues: toValues(draft),
    validators: { onSubmit: schema },
    onSubmit: ({ value }) => save.mutateAsync(value).catch(() => undefined),
  })
}

export type HomeForm = ReturnType<typeof useHomeForm>
