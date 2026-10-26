import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAppForm } from '@/components/form/form-hook'
import { emptyRichText, isRichText } from '@/features/cms/editor/rich-text'
import { describeError } from '@/lib/api/errors'
import { emptyToNull } from '@/lib/format'
import { cmsPageService } from '../cms-page.service'
import { cmsPageKeys } from '../queries'
import type { FixedContent } from '../types'

export interface FixedFormValues {
  titleJa: string
  titleEn: string
  seoTitleJa: string
  seoTitleEn: string
  seoDescriptionJa: string
  seoDescriptionEn: string
  /** yyyy-mm-dd; POLICY only (ABOUT must not set it). */
  effectiveDate: string
  /** Rich-text docs kept opaque: their recursive type would blow up the form's path inference. */
  bodyJa: RichDoc
  bodyEn: RichDoc
}

export type RichDoc = Record<string, unknown>

const toDateInput = (iso: string | null) => (iso ? iso.slice(0, 10) : '')

function toValues(fixed: FixedContent): FixedFormValues {
  return {
    titleJa: fixed.titleJa ?? '',
    titleEn: fixed.titleEn ?? '',
    seoTitleJa: fixed.seoTitleJa ?? '',
    seoTitleEn: fixed.seoTitleEn ?? '',
    seoDescriptionJa: fixed.seoDescriptionJa ?? '',
    seoDescriptionEn: fixed.seoDescriptionEn ?? '',
    effectiveDate: toDateInput(fixed.effectiveAt),
    bodyJa: (isRichText(fixed.bodyJa) ? fixed.bodyJa : emptyRichText()) as unknown as RichDoc,
    bodyEn: (isRichText(fixed.bodyEn) ? fixed.bodyEn : emptyRichText()) as unknown as RichDoc,
  }
}

/**
 * Canonical ABOUT/POLICY drafts: one bilingual rich-text body. PUT content-pages
 * with bodyJa + bodyEn (both required together) instead of a whole document.
 */
export function useFixedForm(pageId: string, fixed: FixedContent) {
  const queryClient = useQueryClient()
  const save = useMutation({
    mutationFn: (values: FixedFormValues) =>
      cmsPageService.updateFixed(pageId, {
        draftVersionId: fixed.draftVersionId,
        expectedRevision: fixed.expectedRevision,
        titleJa: emptyToNull(values.titleJa),
        titleEn: emptyToNull(values.titleEn),
        seoTitleJa: emptyToNull(values.seoTitleJa),
        seoTitleEn: emptyToNull(values.seoTitleEn),
        seoDescriptionJa: emptyToNull(values.seoDescriptionJa),
        seoDescriptionEn: emptyToNull(values.seoDescriptionEn),
        effectiveAt: fixed.pageType === 'POLICY' && values.effectiveDate ? new Date(`${values.effectiveDate}T00:00:00`).toISOString() : null,
        bodyJa: values.bodyJa,
        bodyEn: values.bodyEn,
      }),
    onSuccess: async (updated) => {
      toast.success('Đã lưu nội dung')
      queryClient.setQueryData(cmsPageKeys.fixed(pageId), updated)
      await queryClient.invalidateQueries({ queryKey: cmsPageKeys.detail(pageId) })
    },
    onError: (error) => toast.error(describeError(error)),
  })

  return useAppForm({
    defaultValues: toValues(fixed),
    onSubmit: ({ value }) => save.mutateAsync(value).catch(() => undefined),
  })
}

export type FixedForm = ReturnType<typeof useFixedForm>
