import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { z } from 'zod'
import { useAppForm } from '@/components/form/form-hook'
import { hasText } from '@/features/cms/editor/rich-text'
import { describeError } from '@/lib/api/errors'
import { emptyToNull } from '@/lib/format'
import { ABOUT_TEMPLATE } from '../about-template'
import { cmsPageService } from '../cms-page.service'
import { cmsPageKeys } from '../queries'
import type { FixedContent } from '../types'

/** The eight ABOUT slots of the API's structured (schemaVersion 2) profile, in page order. */
export const ABOUT_SLOTS = [
  'COMPANY_OVERVIEW',
  'BRAND_PHILOSOPHY',
  'MISSION',
  'VISION',
  'CORE_VALUES',
  'OUR_PROMISE',
  'KNOWLEDGE_COMMUNITY',
  'CONTACT',
] as const
type AboutSlot = (typeof ABOUT_SLOTS)[number]

/** Rich-text docs kept opaque: their recursive type would blow up the form's path inference. */
export type RichDoc = Record<string, unknown>

export interface OverviewRow {
  id: string
  labelJa: string
  labelEn: string
  valueJa: string
  valueEn: string
}

export interface CoreValue {
  id: string
  titleJa: string
  titleEn: string
  bodyJa: string
  bodyEn: string
}

export interface RichBody {
  bodyJa: RichDoc
  bodyEn: RichDoc
}

export interface HeadedRichBody extends RichBody {
  headingJa: string
  headingEn: string
}

export interface AboutFormValues {
  titleJa: string
  titleEn: string
  seoTitleJa: string
  seoTitleEn: string
  seoDescriptionJa: string
  seoDescriptionEn: string
  overview: OverviewRow[]
  philosophy: HeadedRichBody
  mission: RichBody
  vision: RichBody
  values: CoreValue[]
  promise: RichBody
  knowledge: RichBody
  contact: HeadedRichBody
}

type Section = { id: string; type: string; settings: Record<string, unknown> }

const str = (value: unknown) => (typeof value === 'string' ? value : '')
const sectionsOf = (content: Record<string, unknown> | null): Section[] =>
  content?.schemaVersion === 2 && Array.isArray(content.sections) ? (content.sections as Section[]) : []

/** Values for the editor: saved structured slots, falling back per slot to the amb-storage.com template. */
export function aboutTemplateValues(): Omit<AboutFormValues, 'seoTitleJa' | 'seoTitleEn' | 'seoDescriptionJa' | 'seoDescriptionEn'> {
  const t = structuredClone(ABOUT_TEMPLATE)
  return {
    titleJa: t.titleJa,
    titleEn: t.titleEn,
    overview: t.overview.map((row) => ({ id: crypto.randomUUID(), ...row })),
    philosophy: t.philosophy,
    mission: t.mission,
    vision: t.vision,
    values: t.values.map((value) => ({ id: crypto.randomUUID(), ...value })),
    promise: t.promise,
    knowledge: t.knowledge,
    contact: t.contact,
  }
}

function toValues(fixed: FixedContent): AboutFormValues {
  const template = aboutTemplateValues()
  const sections = sectionsOf(fixed.content)
  const slot = (type: AboutSlot) => sections.find((section) => section.type === type)?.settings
  const rich = (type: AboutSlot, fallback: RichBody): RichBody => {
    const settings = slot(type)
    return settings ? { bodyJa: settings.bodyJa as RichDoc, bodyEn: settings.bodyEn as RichDoc } : fallback
  }
  const headed = (type: AboutSlot, fallback: HeadedRichBody): HeadedRichBody => {
    const settings = slot(type)
    return settings ? { headingJa: str(settings.headingJa), headingEn: str(settings.headingEn), ...rich(type, fallback) } : fallback
  }
  const overview = slot('COMPANY_OVERVIEW')?.rows as OverviewRow[] | undefined
  const values = slot('CORE_VALUES')?.items as Array<CoreValue & { position: number }> | undefined
  const isStructured = sections.length > 0
  return {
    titleJa: fixed.titleJa ?? (isStructured ? '' : template.titleJa),
    titleEn: fixed.titleEn ?? (isStructured ? '' : template.titleEn),
    seoTitleJa: fixed.seoTitleJa ?? '',
    seoTitleEn: fixed.seoTitleEn ?? '',
    seoDescriptionJa: fixed.seoDescriptionJa ?? '',
    seoDescriptionEn: fixed.seoDescriptionEn ?? '',
    overview: overview ? overview.map(({ id, labelJa, labelEn, valueJa, valueEn }) => ({ id, labelJa, labelEn, valueJa, valueEn })) : template.overview,
    philosophy: headed('BRAND_PHILOSOPHY', template.philosophy),
    mission: rich('MISSION', template.mission),
    vision: rich('VISION', template.vision),
    values: values
      ? [...values].sort((a, b) => a.position - b.position).map(({ id, titleJa, titleEn, bodyJa, bodyEn }) => ({ id, titleJa, titleEn, bodyJa, bodyEn }))
      : template.values,
    promise: rich('OUR_PROMISE', template.promise),
    knowledge: rich('KNOWLEDGE_COMMUNITY', template.knowledge),
    contact: headed('CONTACT', template.contact),
  }
}

/** Builds the schemaVersion 2 document, keeping existing section ids so versions diff cleanly. */
function toContent(values: AboutFormValues, fixed: FixedContent) {
  const ids = new Map(sectionsOf(fixed.content).map((section) => [section.type, section.id]))
  const section = (type: AboutSlot, settings: Record<string, unknown>) => ({
    id: ids.get(type) ?? crypto.randomUUID(),
    type,
    schemaVersion: 2,
    enabled: true,
    settings,
    blocks: [],
  })
  const trimmed = <T extends object>(row: T) =>
    Object.fromEntries(Object.entries(row).map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value])) as T
  // Headings are optional, but the API wants both languages or neither.
  const headed = ({ headingJa, headingEn, bodyJa, bodyEn }: HeadedRichBody) =>
    headingJa.trim() || headingEn.trim() ? { headingJa: headingJa.trim(), headingEn: headingEn.trim(), bodyJa, bodyEn } : { bodyJa, bodyEn }
  return {
    schemaVersion: 2,
    sections: [
      section('COMPANY_OVERVIEW', { rows: values.overview.map(trimmed) }),
      section('BRAND_PHILOSOPHY', headed(values.philosophy)),
      section('MISSION', { bodyJa: values.mission.bodyJa, bodyEn: values.mission.bodyEn }),
      section('VISION', { bodyJa: values.vision.bodyJa, bodyEn: values.vision.bodyEn }),
      section('CORE_VALUES', { items: values.values.map((value, index) => ({ ...trimmed(value), position: index + 1 })) }),
      section('OUR_PROMISE', { bodyJa: values.promise.bodyJa, bodyEn: values.promise.bodyEn }),
      section('KNOWLEDGE_COMMUNITY', { bodyJa: values.knowledge.bodyJa, bodyEn: values.knowledge.bodyEn }),
      section('CONTACT', headed(values.contact)),
    ],
  }
}

/* Mirrors validateAboutSection: every slot is checked even in drafts, so catch gaps before the API does. */
const required = z.string().trim().min(1, 'Bắt buộc').max(5000, 'Tối đa 5000 ký tự')
const requiredLong = z.string().trim().min(1, 'Bắt buộc').max(20000, 'Tối đa 20000 ký tự')
const richRequired = z.custom<RichDoc>((value) => hasText(value), 'Cần có nội dung')
const richBody = z.object({ bodyJa: richRequired, bodyEn: richRequired })
const headedBody = richBody
  .extend({ headingJa: z.string().max(5000), headingEn: z.string().max(5000) })
  .superRefine((value, context) => {
    const ja = Boolean(value.headingJa.trim())
    const en = Boolean(value.headingEn.trim())
    if (ja && !en) context.addIssue({ code: 'custom', path: ['headingEn'], message: 'Nhập cả tiêu đề tiếng Anh, hoặc để trống cả hai' })
    if (en && !ja) context.addIssue({ code: 'custom', path: ['headingJa'], message: 'Nhập cả tiêu đề tiếng Nhật, hoặc để trống cả hai' })
  })
const schema = z.object({
  titleJa: z.string(),
  titleEn: z.string(),
  seoTitleJa: z.string(),
  seoTitleEn: z.string(),
  seoDescriptionJa: z.string(),
  seoDescriptionEn: z.string(),
  overview: z.array(z.object({ id: z.string(), labelJa: required, labelEn: required, valueJa: required, valueEn: required })).max(48),
  philosophy: headedBody,
  mission: richBody,
  vision: richBody,
  values: z
    .array(z.object({ id: z.string(), titleJa: required, titleEn: required, bodyJa: requiredLong, bodyEn: requiredLong }))
    .min(1, 'Cần ít nhất một giá trị')
    .max(48),
  promise: richBody,
  knowledge: richBody,
  contact: headedBody,
})

/** True when the saved draft is not yet in the structured layout (the editor starts from the template). */
export const isAboutTemplateDraft = (fixed: FixedContent) => sectionsOf(fixed.content).length === 0

/** Structured About editor: PUT content-pages with a schemaVersion 2 `content` document. */
export function useAboutForm(pageId: string, fixed: FixedContent) {
  const queryClient = useQueryClient()
  const save = useMutation({
    mutationFn: (values: AboutFormValues) =>
      cmsPageService.updateFixed(pageId, {
        draftVersionId: fixed.draftVersionId,
        expectedRevision: fixed.expectedRevision,
        titleJa: emptyToNull(values.titleJa),
        titleEn: emptyToNull(values.titleEn),
        seoTitleJa: emptyToNull(values.seoTitleJa),
        seoTitleEn: emptyToNull(values.seoTitleEn),
        seoDescriptionJa: emptyToNull(values.seoDescriptionJa),
        seoDescriptionEn: emptyToNull(values.seoDescriptionEn),
        effectiveAt: null,
        content: toContent(values, fixed),
      }),
    onSuccess: async (updated) => {
      toast.success('Đã lưu trang Giới thiệu')
      queryClient.setQueryData(cmsPageKeys.fixed(pageId), updated)
      await queryClient.invalidateQueries({ queryKey: cmsPageKeys.detail(pageId) })
    },
    onError: (error) => toast.error(describeError(error)),
  })

  return useAppForm({
    defaultValues: toValues(fixed),
    validators: { onSubmit: schema },
    onSubmit: ({ value }) => save.mutateAsync(value).catch(() => undefined),
  })
}

export type AboutForm = ReturnType<typeof useAboutForm>
