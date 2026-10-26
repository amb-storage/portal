import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { describeError } from '@/lib/api/errors'
import { cmsPageService } from '../cms-page.service'
import { POLICY_TEMPLATES, policyTemplateContent } from '../policy-template'
import { cmsPageKeys } from '../queries'
import type { PageListRow } from '../types'
import { isPolicyUnstructured } from './use-policy-form'

/**
 * Creates the amb-storage.com policy pages that are missing and fills every template page whose
 * draft is not structured yet. Drafts only: each page still has to be reviewed and published.
 */
export function useSeedPolicies(existing: PageListRow[] | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const created: string[] = []
      const filled: string[] = []
      for (const template of POLICY_TEMPLATES) {
        let pageId = existing?.find((row) => row.slug === template.slug)?.id
        if (!pageId) {
          pageId = (await cmsPageService.create({ slug: template.slug, type: 'POLICY' })).id
          created.push(template.slug)
        }
        const fixed = await cmsPageService.getFixed(pageId)
        if (!isPolicyUnstructured(fixed)) continue
        await cmsPageService.updateFixed(pageId, {
          draftVersionId: fixed.draftVersionId,
          expectedRevision: fixed.expectedRevision,
          titleJa: template.titleJa,
          titleEn: template.titleEn,
          effectiveAt: new Date(new Date().toDateString()).toISOString(),
          content: policyTemplateContent(template),
        })
        filled.push(template.slug)
      }
      return { created, filled }
    },
    onSuccess: ({ created, filled }) => {
      if (created.length + filled.length === 0) toast.info('Các trang chính sách mẫu đã có bố cục theo mục, không có gì thay đổi.')
      else
        toast.success(
          [created.length ? `Đã tạo ${created.join(', ')}.` : '', filled.length ? `Đã điền nháp cho ${filled.join(', ')}.` : '', 'Mở từng trang để kiểm tra rồi Xuất bản.']
            .filter(Boolean)
            .join(' '),
        )
    },
    onError: (error) => toast.error(describeError(error)),
    // Partial runs (e.g. a slug conflict halfway) still changed data.
    onSettled: () => queryClient.invalidateQueries({ queryKey: cmsPageKeys.all }),
  })
}
