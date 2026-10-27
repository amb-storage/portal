import { documentIssues, parseDocumentV1 } from '@/features/cms/editor/document'
import type { SectionRegistry } from '@/features/cms/pages/types'
import { emptyToNull } from '@/lib/format'
import type { BlogPostDraft } from './blog.types'

export interface BlogDraftFormValues {
  titleJa: string
  titleEn: string
  seoTitleJa: string
  seoTitleEn: string
  seoDescriptionJa: string
  seoDescriptionEn: string
  content: string
}

export function toBlogDraftValues(source: BlogPostDraft): BlogDraftFormValues {
  return {
    titleJa: source.titleJa ?? '',
    titleEn: source.titleEn ?? '',
    seoTitleJa: source.seoTitleJa ?? '',
    seoTitleEn: source.seoTitleEn ?? '',
    seoDescriptionJa: source.seoDescriptionJa ?? '',
    seoDescriptionEn: source.seoDescriptionEn ?? '',
    content: JSON.stringify(source.content ?? { schemaVersion: 1, sections: [] }, null, 2),
  }
}

function validateJson(value: string) {
  try {
    const parsed: unknown = JSON.parse(value)
    return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed) ? undefined : 'Nội dung phải là một object JSON'
  } catch (error) {
    return `JSON không hợp lệ: ${(error as Error).message}`
  }
}

export function validateBlogContent(value: string, registry: SectionRegistry | undefined) {
  const jsonError = validateJson(value)
  if (jsonError || !registry) return jsonError
  const document = parseDocumentV1(value)
  const issues = document ? documentIssues(document, registry.sections, registry.blocks) : []
  return issues.length ? `Còn ${issues.length} chỗ cần sửa trong nội dung` : undefined
}

export function toBlogDraftPayload(values: BlogDraftFormValues) {
  return {
    titleJa: emptyToNull(values.titleJa),
    titleEn: emptyToNull(values.titleEn),
    seoTitleJa: emptyToNull(values.seoTitleJa),
    seoTitleEn: emptyToNull(values.seoTitleEn),
    seoDescriptionJa: emptyToNull(values.seoDescriptionJa),
    seoDescriptionEn: emptyToNull(values.seoDescriptionEn),
    content: JSON.parse(values.content) as Record<string, unknown>,
  }
}
