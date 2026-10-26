import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { z } from 'zod'
import { useAppForm } from '@/components/form/form-hook'
import { describeError } from '@/lib/api/errors'
import { emptyToNull } from '@/lib/format'
import { cmsPageService } from '../cms-page.service'
import { policyTemplateContent, policyTemplateFor } from '../policy-template'
import { cmsPageKeys } from '../queries'
import type { CmsPage, FixedContent } from '../types'

/*
 * Structured POLICY editor (schemaVersion 2 POLICY_SECTIONs). Each legal list is edited as a
 * pair of textareas: paragraphs/notes are separated by a blank line, bullets are one per line,
 * and the Japanese and English lists are matched by position.
 */

export interface PolicyDetailValues {
  id: string
  titleJa: string
  titleEn: string
  paragraphsJa: string
  paragraphsEn: string
  bulletsJa: string
  bulletsEn: string
}

export interface PolicySectionValues {
  id: string
  anchorKey: string
  titleJa: string
  titleEn: string
  paragraphsJa: string
  paragraphsEn: string
  bulletsJa: string
  bulletsEn: string
  details: PolicyDetailValues[]
  notesJa: string
  notesEn: string
}

export interface PolicyFormValues {
  titleJa: string
  titleEn: string
  seoTitleJa: string
  seoTitleEn: string
  seoDescriptionJa: string
  seoDescriptionEn: string
  /** yyyy-mm-dd; required before publishing. */
  effectiveDate: string
  sections: PolicySectionValues[]
}

type LegalItem = { textJa: string; textEn: string }
type Kind = 'blocks' | 'lines'

const splitText = (value: string, kind: Kind) =>
  value
    .split(kind === 'blocks' ? /\n\s*\n/ : /\n/)
    .map((item) => item.trim())
    .filter(Boolean)
const joinText = (items: LegalItem[] | undefined, lang: 'textJa' | 'textEn', kind: Kind) =>
  (items ?? []).map((item) => item[lang]).join(kind === 'blocks' ? '\n\n' : '\n')
const toItems = (ja: string, en: string, kind: Kind) => {
  const jaItems = splitText(ja, kind)
  const enItems = splitText(en, kind)
  return jaItems.map((textJa, index) => ({ id: crypto.randomUUID(), textJa, textEn: enItems[index] ?? '' }))
}

export const emptyPolicyDetail = (): PolicyDetailValues => ({
  id: crypto.randomUUID(),
  titleJa: '',
  titleEn: '',
  paragraphsJa: '',
  paragraphsEn: '',
  bulletsJa: '',
  bulletsEn: '',
})

export const emptyPolicySection = (anchorKey = ''): PolicySectionValues => ({
  id: crypto.randomUUID(),
  anchorKey,
  titleJa: '',
  titleEn: '',
  paragraphsJa: '',
  paragraphsEn: '',
  bulletsJa: '',
  bulletsEn: '',
  details: [],
  notesJa: '',
  notesEn: '',
})

type RawSection = { id: string; type: string; settings: Record<string, unknown> }
type RawDetail = { id: string; titleJa?: string; titleEn?: string; paragraphs?: LegalItem[]; bullets?: LegalItem[] }

const structuredSections = (content: Record<string, unknown> | null): RawSection[] =>
  content?.schemaVersion === 2 && Array.isArray(content.sections) ? (content.sections as RawSection[]) : []

export function toSectionValues(content: Record<string, unknown> | null): PolicySectionValues[] {
  return structuredSections(content).map(({ id, settings }) => {
    const list = (key: string) => settings[key] as LegalItem[] | undefined
    return {
      id,
      anchorKey: String(settings.anchorKey ?? ''),
      titleJa: String(settings.titleJa ?? ''),
      titleEn: String(settings.titleEn ?? ''),
      paragraphsJa: joinText(list('paragraphs'), 'textJa', 'blocks'),
      paragraphsEn: joinText(list('paragraphs'), 'textEn', 'blocks'),
      bulletsJa: joinText(list('bullets'), 'textJa', 'lines'),
      bulletsEn: joinText(list('bullets'), 'textEn', 'lines'),
      details: ((settings.details as RawDetail[] | undefined) ?? []).map((detail) => ({
        id: detail.id,
        titleJa: detail.titleJa ?? '',
        titleEn: detail.titleEn ?? '',
        paragraphsJa: joinText(detail.paragraphs, 'textJa', 'blocks'),
        paragraphsEn: joinText(detail.paragraphs, 'textEn', 'blocks'),
        bulletsJa: joinText(detail.bullets, 'textJa', 'lines'),
        bulletsEn: joinText(detail.bullets, 'textEn', 'lines'),
      })),
      notesJa: joinText(list('notes'), 'textJa', 'blocks'),
      notesEn: joinText(list('notes'), 'textEn', 'blocks'),
    }
  })
}

function toContent(sections: PolicySectionValues[]) {
  return {
    schemaVersion: 2,
    sections: sections.map((section) => ({
      id: section.id,
      type: 'POLICY_SECTION',
      schemaVersion: 2,
      enabled: true,
      settings: {
        anchorKey: section.anchorKey.trim(),
        titleJa: section.titleJa.trim(),
        titleEn: section.titleEn.trim(),
        paragraphs: toItems(section.paragraphsJa, section.paragraphsEn, 'blocks'),
        bullets: toItems(section.bulletsJa, section.bulletsEn, 'lines'),
        details: section.details.map((detail) => ({
          id: detail.id,
          ...(detail.titleJa.trim() || detail.titleEn.trim() ? { titleJa: detail.titleJa.trim(), titleEn: detail.titleEn.trim() } : {}),
          paragraphs: toItems(detail.paragraphsJa, detail.paragraphsEn, 'blocks'),
          bullets: toItems(detail.bulletsJa, detail.bulletsEn, 'lines'),
        })),
        notes: toItems(section.notesJa, section.notesEn, 'blocks'),
      },
      blocks: [],
    })),
  }
}

/** True when the saved draft is not in the structured layout yet. */
export const isPolicyUnstructured = (fixed: FixedContent) => structuredSections(fixed.content).length === 0

const today = () => new Date().toLocaleDateString('sv-SE')
const toDateInput = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString('sv-SE') : '')

function toValues(page: CmsPage, fixed: FixedContent): PolicyFormValues {
  const template = isPolicyUnstructured(fixed) ? policyTemplateFor(page.slug) : undefined
  return {
    titleJa: fixed.titleJa ?? template?.titleJa ?? '',
    titleEn: fixed.titleEn ?? template?.titleEn ?? '',
    seoTitleJa: fixed.seoTitleJa ?? '',
    seoTitleEn: fixed.seoTitleEn ?? '',
    seoDescriptionJa: fixed.seoDescriptionJa ?? '',
    seoDescriptionEn: fixed.seoDescriptionEn ?? '',
    effectiveDate: toDateInput(fixed.effectiveAt) || (template ? today() : ''),
    sections: template
      ? toSectionValues(policyTemplateContent(template))
      : isPolicyUnstructured(fixed)
        ? [emptyPolicySection(page.slug.replace(/-policy$/, '') || 'section')]
        : toSectionValues(fixed.content),
  }
}

/* Mirrors validatePolicy on the API so problems show next to the field instead of as a 400. */
const ANCHOR = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const count = (value: string, kind: Kind) => splitText(value, kind).length
const pairCheck = (context: z.RefinementCtx, ja: string, en: string, kind: Kind, path: (string | number)[], label: string) => {
  const jaCount = count(ja, kind)
  const enCount = count(en, kind)
  if (jaCount !== enCount)
    context.addIssue({ code: 'custom', path: [...path.slice(0, -1), `${path.at(-1)}En`], message: `${label}: tiếng Nhật có ${jaCount} mục, tiếng Anh có ${enCount} mục — cần bằng nhau` })
}
const headingPair = (context: z.RefinementCtx, ja: string, en: string, path: (string | number)[], required: boolean) => {
  const hasJa = Boolean(ja.trim())
  const hasEn = Boolean(en.trim())
  if (required || hasJa || hasEn) {
    if (!hasJa) context.addIssue({ code: 'custom', path: [...path, 'titleJa'], message: required ? 'Bắt buộc' : 'Nhập cả tiêu đề tiếng Nhật, hoặc để trống cả hai' })
    if (!hasEn) context.addIssue({ code: 'custom', path: [...path, 'titleEn'], message: required ? 'Bắt buộc' : 'Nhập cả tiêu đề tiếng Anh, hoặc để trống cả hai' })
  }
}

const schema = z
  .object({
    titleJa: z.string(),
    titleEn: z.string(),
    seoTitleJa: z.string(),
    seoTitleEn: z.string(),
    seoDescriptionJa: z.string(),
    seoDescriptionEn: z.string(),
    effectiveDate: z.string(),
    sections: z.array(z.custom<PolicySectionValues>()).min(1, 'Cần ít nhất một mục').max(50),
  })
  .superRefine((values, context) => {
    const anchors = new Set<string>()
    values.sections.forEach((section, index) => {
      const path = ['sections', index]
      const anchor = section.anchorKey.trim()
      if (!ANCHOR.test(anchor) || anchor.length > 100)
        context.addIssue({ code: 'custom', path: [...path, 'anchorKey'], message: 'Chỉ chữ thường, số và dấu gạch ngang (vd. privacy-policy)' })
      else if (anchors.has(anchor)) context.addIssue({ code: 'custom', path: [...path, 'anchorKey'], message: 'Trùng với một mục khác' })
      anchors.add(anchor)
      headingPair(context, section.titleJa, section.titleEn, path, true)
      pairCheck(context, section.paragraphsJa, section.paragraphsEn, 'blocks', [...path, 'paragraphs'], 'Đoạn văn')
      pairCheck(context, section.bulletsJa, section.bulletsEn, 'lines', [...path, 'bullets'], 'Gạch đầu dòng')
      pairCheck(context, section.notesJa, section.notesEn, 'blocks', [...path, 'notes'], 'Ghi chú')
      section.details.forEach((detail, detailIndex) => {
        const detailPath = [...path, 'details', detailIndex]
        headingPair(context, detail.titleJa, detail.titleEn, detailPath, false)
        pairCheck(context, detail.paragraphsJa, detail.paragraphsEn, 'blocks', [...detailPath, 'paragraphs'], 'Đoạn văn')
        pairCheck(context, detail.bulletsJa, detail.bulletsEn, 'lines', [...detailPath, 'bullets'], 'Gạch đầu dòng')
        if (count(detail.paragraphsJa, 'blocks') + count(detail.bulletsJa, 'lines') === 0)
          context.addIssue({ code: 'custom', path: [...detailPath, 'paragraphsJa'], message: 'Khối chi tiết cần có đoạn văn hoặc gạch đầu dòng' })
      })
      const total =
        count(section.paragraphsJa, 'blocks') + count(section.bulletsJa, 'lines') + count(section.notesJa, 'blocks') + section.details.length
      if (total === 0) context.addIssue({ code: 'custom', path: [...path, 'paragraphsJa'], message: 'Mục cần có ít nhất một đoạn văn, gạch đầu dòng, khối chi tiết hoặc ghi chú' })
    })
  })

export function useFixedPolicyForm(page: CmsPage, fixed: FixedContent) {
  const queryClient = useQueryClient()
  const save = useMutation({
    mutationFn: (values: PolicyFormValues) =>
      cmsPageService.updateFixed(page.id, {
        draftVersionId: fixed.draftVersionId,
        expectedRevision: fixed.expectedRevision,
        titleJa: emptyToNull(values.titleJa),
        titleEn: emptyToNull(values.titleEn),
        seoTitleJa: emptyToNull(values.seoTitleJa),
        seoTitleEn: emptyToNull(values.seoTitleEn),
        seoDescriptionJa: emptyToNull(values.seoDescriptionJa),
        seoDescriptionEn: emptyToNull(values.seoDescriptionEn),
        effectiveAt: values.effectiveDate ? new Date(`${values.effectiveDate}T00:00:00`).toISOString() : null,
        content: toContent(values.sections),
      }),
    onSuccess: async (updated) => {
      toast.success('Đã lưu chính sách')
      queryClient.setQueryData(cmsPageKeys.fixed(page.id), updated)
      await queryClient.invalidateQueries({ queryKey: cmsPageKeys.detail(page.id) })
    },
    onError: (error) => toast.error(describeError(error)),
  })

  return useAppForm({
    defaultValues: toValues(page, fixed),
    validators: { onSubmit: schema },
    onSubmit: ({ value }) => save.mutateAsync(value).catch(() => undefined),
  })
}

export type PolicyForm = ReturnType<typeof useFixedPolicyForm>
