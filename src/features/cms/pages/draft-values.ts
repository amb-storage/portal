import { documentIssues, parseDocumentV1 } from '@/features/cms/editor/document'
import { emptyToNull } from '@/lib/format'
import type { FixedContent, PageVersion, SectionRegistry } from './types'

export interface DraftFormValues {
  titleJa: string
  titleEn: string
  seoTitleJa: string
  seoTitleEn: string
  seoDescriptionJa: string
  seoDescriptionEn: string
  /** datetime-local value (local time), '' = none. */
  effectiveAt: string
  /** Pretty-printed JSON document. */
  content: string
}

function toLocalInput(iso: string | null) {
  if (!iso) return ''
  const date = new Date(iso)
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

export function toDraftValues(source: PageVersion | FixedContent): DraftFormValues {
  return {
    titleJa: source.titleJa ?? '',
    titleEn: source.titleEn ?? '',
    seoTitleJa: source.seoTitleJa ?? '',
    seoTitleEn: source.seoTitleEn ?? '',
    seoDescriptionJa: source.seoDescriptionJa ?? '',
    seoDescriptionEn: source.seoDescriptionEn ?? '',
    effectiveAt: toLocalInput(source.effectiveAt),
    content: JSON.stringify(source.content ?? { schemaVersion: 2, sections: [] }, null, 2),
  }
}

export function validateJson(value: string) {
  try {
    const parsed: unknown = JSON.parse(value)
    return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed) ? undefined : 'Nội dung phải là một object JSON'
  } catch (error) {
    return `JSON không hợp lệ: ${(error as Error).message}`
  }
}

/** Blocks saving a v1 document the API would reject; v2 slot documents are validated server-side. */
export function validateContent(value: string, registry: SectionRegistry | undefined) {
  const jsonError = validateJson(value)
  if (jsonError || !registry) return jsonError
  const doc = parseDocumentV1(value)
  const issues = doc ? documentIssues(doc, registry.sections, registry.blocks) : []
  return issues.length ? `Còn ${issues.length} chỗ cần sửa trong nội dung` : undefined
}

/** Shared body for PUT draft and PUT content-pages (nullable strings cleared with null). */
export function toDraftPayload(values: DraftFormValues) {
  return {
    titleJa: emptyToNull(values.titleJa),
    titleEn: emptyToNull(values.titleEn),
    seoTitleJa: emptyToNull(values.seoTitleJa),
    seoTitleEn: emptyToNull(values.seoTitleEn),
    seoDescriptionJa: emptyToNull(values.seoDescriptionJa),
    seoDescriptionEn: emptyToNull(values.seoDescriptionEn),
    effectiveAt: values.effectiveAt ? new Date(values.effectiveAt).toISOString() : null,
    content: JSON.parse(values.content) as Record<string, unknown>,
  }
}
