import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { z } from 'zod'
import { useAppForm } from '@/components/form/form-hook'
import { describeError } from '@/lib/api/errors'
import { emptyToNull } from '@/lib/format'
import { cmsPageService } from '@/features/cms/pages/cms-page.service'
import { cmsPageKeys } from '@/features/cms/pages/queries'
import type { PageVersion } from '@/features/cms/pages/types'
import { MILI_TALKS_TEMPLATE } from '../mili-talks-template'

/*
 * Mili Talks blog home (MILI_TALKS_LANDING, schemaVersion 2): MILI_TALKS_INTRO, MILI_TALKS_REFERENCES,
 * FEATURED_MILI_TALK and MILI_TALK_GRID sections. Only the intro and Special Thanks are hand-written;
 * the article list fills itself from published stories.
 */

export interface ReferenceGroupValues {
  id: string
  titleJa: string
  titleEn: string
  /** One name per line. */
  itemsJa: string
  /** One name per line, matched to the Japanese by position; empty = same as Japanese. */
  itemsEn: string
}

export interface MiliTalksFormValues {
  titleJa: string
  titleEn: string
  seoTitleJa: string
  seoTitleEn: string
  seoDescriptionJa: string
  seoDescriptionEn: string
  intro: {
    headingJa: string
    headingEn: string
    introductionJa: string
    introductionEn: string
    supportingTextJa: string
    supportingTextEn: string
  }
  referencesEnabled: boolean
  references: ReferenceGroupValues[]
  /** Story id ('' = none). */
  featuredTalkId: string
  grid: {
    titleJa: string
    titleEn: string
    descriptionJa: string
    descriptionEn: string
    source: 'NEWEST' | 'MANUAL'
    talkIds: string[]
    limit: number
  }
}

type Section = { id: string; type: string; enabled: boolean; settings: Record<string, unknown> }
type Item = { id: string; textJa: string; textEn: string }

const str = (value: unknown) => (typeof value === 'string' ? value : '')
const lines = (value: string) =>
  value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
const sectionsOf = (content: unknown): Section[] => {
  const document = content as { schemaVersion?: number; sections?: unknown } | undefined
  return document?.schemaVersion === 2 && Array.isArray(document.sections) ? (document.sections as Section[]) : []
}

export const isMiliTalksTemplateDraft = (draft: PageVersion) => !sectionsOf(draft.content).some((section) => section.type === 'MILI_TALKS_INTRO')

export function miliTalksTemplateValues(): Pick<MiliTalksFormValues, 'titleJa' | 'titleEn' | 'intro' | 'referencesEnabled' | 'references'> {
  const t = MILI_TALKS_TEMPLATE
  return {
    titleJa: t.titleJa,
    titleEn: t.titleEn,
    intro: { ...t.intro },
    referencesEnabled: true,
    references: t.references.map((group) => ({
      id: crypto.randomUUID(),
      titleJa: group.titleJa,
      titleEn: group.titleEn,
      itemsJa: group.items.join('\n'),
      itemsEn: '',
    })),
  }
}

function toValues(draft: PageVersion): MiliTalksFormValues {
  const sections = sectionsOf(draft.content)
  const find = (type: string) => sections.find((section) => section.type === type)
  const intro = find('MILI_TALKS_INTRO')
  const references = find('MILI_TALKS_REFERENCES')
  const featured = find('FEATURED_MILI_TALK')
  const grid = find('MILI_TALK_GRID')
  const template = miliTalksTemplateValues()
  const source = grid?.settings.source as { type?: string; talkIds?: string[] } | undefined
  const groups = references?.settings.groups as Array<{ id: string; titleJa: string; titleEn: string; items: Item[] }> | undefined

  return {
    titleJa: draft.titleJa ?? (intro ? '' : template.titleJa),
    titleEn: draft.titleEn ?? (intro ? '' : template.titleEn),
    seoTitleJa: draft.seoTitleJa ?? '',
    seoTitleEn: draft.seoTitleEn ?? '',
    seoDescriptionJa: draft.seoDescriptionJa ?? '',
    seoDescriptionEn: draft.seoDescriptionEn ?? '',
    intro: intro
      ? {
          headingJa: str(intro.settings.headingJa),
          headingEn: str(intro.settings.headingEn),
          introductionJa: str(intro.settings.introductionJa),
          introductionEn: str(intro.settings.introductionEn),
          supportingTextJa: str(intro.settings.supportingTextJa),
          supportingTextEn: str(intro.settings.supportingTextEn),
        }
      : template.intro,
    // A structured landing without the section keeps it off; a fresh one starts from the live site.
    referencesEnabled: references ? references.enabled : !intro,
    references: groups
      ? groups.map((group) => {
          const sameEn = group.items.every((item) => item.textEn === item.textJa)
          return {
            id: group.id,
            titleJa: group.titleJa,
            titleEn: group.titleEn,
            itemsJa: group.items.map((item) => item.textJa).join('\n'),
            itemsEn: sameEn ? '' : group.items.map((item) => item.textEn).join('\n'),
          }
        })
      : template.references,
    featuredTalkId: featured?.enabled ? str(featured.settings.talkId) : '',
    grid: {
      titleJa: grid ? str(grid.settings.titleJa) : MILI_TALKS_TEMPLATE.grid.titleJa,
      titleEn: grid ? str(grid.settings.titleEn) : MILI_TALKS_TEMPLATE.grid.titleEn,
      descriptionJa: str(grid?.settings.descriptionJa),
      descriptionEn: str(grid?.settings.descriptionEn),
      source: source?.type === 'MANUAL' ? 'MANUAL' : 'NEWEST',
      talkIds: source?.type === 'MANUAL' ? (source.talkIds ?? []) : [],
      limit: typeof grid?.settings.limit === 'number' ? grid.settings.limit : MILI_TALKS_TEMPLATE.grid.limit,
    },
  }
}

/** Builds the document, keeping section ids and any extra grids this editor does not show. */
function toContent(values: MiliTalksFormValues, draft: PageVersion) {
  const existing = sectionsOf(draft.content)
  const idOf = (type: string) => existing.find((section) => section.type === type)?.id ?? crypto.randomUUID()
  const section = (type: string, enabled: boolean, settings: Record<string, unknown>) => ({
    id: idOf(type),
    type,
    schemaVersion: 2,
    enabled,
    settings,
    blocks: [],
  })
  const optionalPair = (ja: string, en: string, jaKey: string, enKey: string) => (ja.trim() && en.trim() ? { [jaKey]: ja.trim(), [enKey]: en.trim() } : {})
  const firstGridId = existing.find((candidate) => candidate.type === 'MILI_TALK_GRID')?.id
  const extraGrids = existing.filter((candidate) => candidate.type === 'MILI_TALK_GRID' && candidate.id !== firstGridId)
  const { intro, grid } = values

  return {
    schemaVersion: 2,
    sections: [
      section('MILI_TALKS_INTRO', true, {
        headingJa: intro.headingJa.trim(),
        headingEn: intro.headingEn.trim(),
        introductionJa: intro.introductionJa.trim(),
        introductionEn: intro.introductionEn.trim(),
        ...optionalPair(intro.supportingTextJa, intro.supportingTextEn, 'supportingTextJa', 'supportingTextEn'),
      }),
      section('MILI_TALKS_REFERENCES', values.referencesEnabled, {
        groups: values.references.map((group) => {
          const ja = lines(group.itemsJa)
          const en = lines(group.itemsEn)
          return {
            id: group.id,
            titleJa: group.titleJa.trim(),
            titleEn: group.titleEn.trim(),
            items: ja.map((textJa, index) => ({ id: crypto.randomUUID(), textJa, textEn: en.length ? en[index] : textJa })),
          }
        }),
      }),
      // A disabled featured slot must carry no settings.
      section('FEATURED_MILI_TALK', Boolean(values.featuredTalkId), values.featuredTalkId ? { talkId: values.featuredTalkId } : {}),
      section('MILI_TALK_GRID', true, {
          titleJa: grid.titleJa.trim(),
          titleEn: grid.titleEn.trim(),
          ...optionalPair(grid.descriptionJa, grid.descriptionEn, 'descriptionJa', 'descriptionEn'),
          source: grid.source === 'MANUAL' ? { type: 'MANUAL', talkIds: grid.talkIds } : { type: 'NEWEST' },
          limit: grid.limit,
        }),
      ...extraGrids,
    ],
  }
}

/* Mirrors validateTalkLanding / validateTalkReferences so mistakes show next to the field. */
const required = z.string().trim().min(1, 'Bắt buộc')
/** Optional bilingual pair: both filled or both empty; flags the empty side. */
const pairCheck = (context: z.RefinementCtx, ja: string, en: string, base: string, key: string) => {
  if (Boolean(ja.trim()) === Boolean(en.trim())) return
  context.addIssue({ code: 'custom', path: [base, `${key}${ja.trim() ? 'En' : 'Ja'}`], message: 'Nhập cả hai ngôn ngữ, hoặc để trống cả hai' })
}

const schema = z
  .object({
    titleJa: z.string(),
    titleEn: z.string(),
    seoTitleJa: z.string(),
    seoTitleEn: z.string(),
    seoDescriptionJa: z.string(),
    seoDescriptionEn: z.string(),
    intro: z.object({
      headingJa: required,
      headingEn: required,
      introductionJa: required,
      introductionEn: required,
      supportingTextJa: z.string(),
      supportingTextEn: z.string(),
    }),
    referencesEnabled: z.boolean(),
    references: z.array(z.custom<ReferenceGroupValues>()),
    featuredTalkId: z.string(),
    grid: z.object({
      titleJa: required,
      titleEn: required,
      descriptionJa: z.string(),
      descriptionEn: z.string(),
      source: z.enum(['NEWEST', 'MANUAL']),
      talkIds: z.array(z.string()),
      limit: z.number().int().min(1, 'Từ 1 đến 24').max(24, 'Từ 1 đến 24'),
    }),
  })
  .superRefine((values, context) => {
    pairCheck(context, values.intro.supportingTextJa, values.intro.supportingTextEn, 'intro', 'supportingText')
    pairCheck(context, values.grid.descriptionJa, values.grid.descriptionEn, 'grid', 'description')
    if (values.grid.source === 'MANUAL' && values.grid.talkIds.length === 0)
      context.addIssue({ code: 'custom', path: ['grid', 'talkIds'], message: 'Chọn ít nhất một bài' })
    if (values.references.length > 12) context.addIssue({ code: 'custom', path: ['references'], message: 'Tối đa 12 cột' })
    if (values.referencesEnabled && values.references.length === 0) context.addIssue({ code: 'custom', path: ['references'], message: 'Thêm ít nhất một cột, hoặc tắt Special Thanks' })
    values.references.forEach((group, index) => {
      const path = ['references', index]
      if (!group.titleJa.trim()) context.addIssue({ code: 'custom', path: [...path, 'titleJa'], message: 'Bắt buộc' })
      if (!group.titleEn.trim()) context.addIssue({ code: 'custom', path: [...path, 'titleEn'], message: 'Bắt buộc' })
      const ja = lines(group.itemsJa).length
      const en = lines(group.itemsEn).length
      if (ja === 0) context.addIssue({ code: 'custom', path: [...path, 'itemsJa'], message: 'Thêm ít nhất một tên' })
      else if (ja > 48) context.addIssue({ code: 'custom', path: [...path, 'itemsJa'], message: 'Tối đa 48 tên mỗi cột' })
      if (en > 0 && en !== ja)
        context.addIssue({ code: 'custom', path: [...path, 'itemsEn'], message: `Tiếng Nhật có ${ja} tên, tiếng Anh có ${en} — cần bằng nhau, hoặc để trống để dùng giống tiếng Nhật` })
    })
  })

export function useMiliTalksForm(pageId: string, draft: PageVersion) {
  const queryClient = useQueryClient()
  const save = useMutation({
    mutationFn: (values: MiliTalksFormValues) =>
      cmsPageService.updateDraft(pageId, {
        draftVersionId: draft.id,
        expectedRevision: draft.revision,
        titleJa: emptyToNull(values.titleJa),
        titleEn: emptyToNull(values.titleEn),
        seoTitleJa: emptyToNull(values.seoTitleJa),
        seoTitleEn: emptyToNull(values.seoTitleEn),
        seoDescriptionJa: emptyToNull(values.seoDescriptionJa),
        seoDescriptionEn: emptyToNull(values.seoDescriptionEn),
        effectiveAt: null,
        content: toContent(values, draft),
      }),
    onSuccess: async (updated) => {
      toast.success('Đã lưu trang chủ blog')
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

export type MiliTalksForm = ReturnType<typeof useMiliTalksForm>
