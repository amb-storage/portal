import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { z } from 'zod'
import { useAppForm } from '@/components/form/form-hook'
import { describeError } from '@/lib/api/errors'
import { cmsPageService } from '@/features/cms/pages/cms-page.service'
import { cmsPageKeys } from '@/features/cms/pages/queries'
import type { PageVersion } from '@/features/cms/pages/types'

/*
 * The Home page's CUSTOMER_VOICE slot (schemaVersion 2), edited on its own: the rest of the Home
 * draft is sent back unchanged. The website only shows a voice that links a product with a photo.
 */

export interface VoiceValues {
  id: string
  nameJa: string
  nameEn: string
  quoteJa: string
  quoteEn: string
  productId: string
}

export interface CustomerVoiceValues {
  enabled: boolean
  items: VoiceValues[]
}

type Section = { id: string; type: string; schemaVersion: number; enabled: boolean; settings: Record<string, unknown>; blocks: unknown[] }

const sectionsOf = (draft: PageVersion): Section[] => {
  const content = draft.content as { schemaVersion?: number; sections?: unknown } | undefined
  return content?.schemaVersion === 2 && Array.isArray(content.sections) ? (content.sections as Section[]) : []
}

/** Legacy schemaVersion 1 Home drafts cannot take structured slots. */
export const isStructuredHome = (draft: PageVersion) => (draft.content as { schemaVersion?: number } | undefined)?.schemaVersion === 2

export const emptyVoice = (): VoiceValues => ({ id: crypto.randomUUID(), nameJa: '', nameEn: '', quoteJa: '', quoteEn: '', productId: '' })

function toValues(draft: PageVersion): CustomerVoiceValues {
  const section = sectionsOf(draft).find((candidate) => candidate.type === 'CUSTOMER_VOICE')
  const items = (section?.settings.items as Array<Record<string, unknown>> | undefined) ?? []
  const str = (value: unknown) => (typeof value === 'string' ? value : '')
  return {
    enabled: section ? section.enabled : true,
    items: items.length
      ? items.map((item) => ({
          id: str(item.id) || crypto.randomUUID(),
          nameJa: str(item.nameJa),
          nameEn: str(item.nameEn),
          quoteJa: str(item.quoteJa),
          quoteEn: str(item.quoteEn),
          productId: str(item.productId),
        }))
      : [emptyVoice()],
  }
}

function toContent(values: CustomerVoiceValues, draft: PageVersion) {
  const sections = sectionsOf(draft)
  const existing = sections.find((candidate) => candidate.type === 'CUSTOMER_VOICE')
  const voice: Section = {
    id: existing?.id ?? crypto.randomUUID(),
    type: 'CUSTOMER_VOICE',
    schemaVersion: 2,
    enabled: values.enabled,
    blocks: [],
    settings: {
      items: values.items.map((item) => ({
        id: item.id,
        // Names are optional; the API only accepts them as non-empty strings.
        ...(item.nameJa.trim() ? { nameJa: item.nameJa.trim() } : {}),
        ...(item.nameEn.trim() ? { nameEn: item.nameEn.trim() } : {}),
        quoteJa: item.quoteJa.trim(),
        quoteEn: item.quoteEn.trim(),
        ...(item.productId ? { productId: item.productId } : {}),
      })),
    },
  }
  return {
    schemaVersion: 2,
    sections: existing ? sections.map((section) => (section.id === existing.id ? voice : section)) : [...sections, voice],
  }
}

const required = z.string().trim().min(1, 'Bắt buộc').max(20000)
const schema = z.object({
  enabled: z.boolean(),
  items: z
    .array(
      z.object({
        id: z.string(),
        nameJa: z.string().max(5000),
        nameEn: z.string().max(5000),
        quoteJa: required,
        quoteEn: required,
        productId: z.string().min(1, 'Chọn sản phẩm: website chỉ hiện đánh giá có gắn sản phẩm (ảnh sản phẩm là hình của thẻ)'),
      }),
    )
    .min(1, 'Cần ít nhất một đánh giá')
    .max(48, 'Tối đa 48 đánh giá'),
})

export function useCustomerVoiceForm(pageId: string, draft: PageVersion) {
  const queryClient = useQueryClient()
  const save = useMutation({
    mutationFn: (values: CustomerVoiceValues) =>
      cmsPageService.updateDraft(pageId, {
        draftVersionId: draft.id,
        expectedRevision: draft.revision,
        // Everything except the Customer Voice slot goes back exactly as it was.
        titleJa: draft.titleJa,
        titleEn: draft.titleEn,
        seoTitleJa: draft.seoTitleJa,
        seoTitleEn: draft.seoTitleEn,
        seoDescriptionJa: draft.seoDescriptionJa,
        seoDescriptionEn: draft.seoDescriptionEn,
        effectiveAt: draft.effectiveAt,
        content: toContent(values, draft),
      }),
    onSuccess: async (updated) => {
      toast.success('Đã lưu Customer Voice vào bản nháp trang chủ')
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

export type CustomerVoiceForm = ReturnType<typeof useCustomerVoiceForm>
