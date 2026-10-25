import type { PublishChecklistItem } from '@/components/common/publish-checklist-card'
import type { CmsSection, ContentProfile } from './types'

/** Mirrors validateStoryArticlePublication's body-section set. */
const ARTICLE_BODY = new Set(['RICH_TEXT', 'IMAGE', 'IMAGE_WITH_TEXT', 'CONTACT', 'GALLERY', 'QUOTE'])

interface DraftLike {
  titleJa: string | null
  titleEn: string | null
  effectiveAt: string | null
  content?: unknown
}

const filled = (value: unknown) => typeof value === 'string' && value.trim().length > 0

/**
 * Client-side mirror of the API's publish checks (requireLocalizedTitle,
 * CMS_NOT_PUBLISHABLE, validateFixedPublication, validateStoryArticlePublication).
 * The API stays authoritative, e.g. it also requires the cover media to be READY.
 */
export function cmsPublishChecklist(draft: DraftLike, profile: ContentProfile): PublishChecklistItem[] {
  const items: PublishChecklistItem[] = [
    { key: 'titleJa', label: 'Tiêu đề tiếng Nhật', done: filled(draft.titleJa) },
    { key: 'titleEn', label: 'Tiêu đề tiếng Anh', done: filled(draft.titleEn) },
  ]
  if (profile === 'FIXED_POLICY') items.push({ key: 'effectiveAt', label: 'Ngày hiệu lực', done: Boolean(draft.effectiveAt) })

  const content = draft.content as { schemaVersion?: number; sections?: CmsSection[] } | undefined
  if (content?.schemaVersion !== 1 || !Array.isArray(content.sections)) return items
  const enabled = content.sections.filter((section) => section.enabled)
  items.push({ key: 'sections', label: 'Ít nhất một khối đang hiển thị', done: enabled.length > 0 })

  if (profile === 'MILI_TALK_ARTICLE') {
    const headers = content.sections.filter((section) => section.type === 'TALK_HEADER')
    const header = headers.length === 1 && headers[0].enabled ? headers[0] : undefined
    items.push(
      { key: 'header', label: 'Một khối “Đầu bài viết” đang hiển thị', done: Boolean(header) },
      { key: 'cover', label: 'Ảnh bìa', done: typeof header?.settings.coverMediaId === 'string' },
      { key: 'excerptJa', label: 'Tóm tắt tiếng Nhật', done: filled(header?.settings.excerptJa) },
      { key: 'excerptEn', label: 'Tóm tắt tiếng Anh', done: filled(header?.settings.excerptEn) },
      { key: 'body', label: 'Ít nhất một khối nội dung (Đoạn văn, Ảnh, Trích dẫn…)', done: enabled.some((section) => ARTICLE_BODY.has(section.type)) },
    )
  }
  return items
}
