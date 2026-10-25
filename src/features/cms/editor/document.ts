import { emptyRichText, isRichText, isSafeLink } from './rich-text'
import { sectionLabel, settingLabel } from './labels'
import type { BlockDef, CmsBlock, CmsDocumentV1, CmsSection, ContentProfile, SectionDef, SettingDef } from './types'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const isUuid = (value: unknown) => typeof value === 'string' && UUID.test(value)
/** Mirrors content-validator: these media keys hold one id, other media keys hold an array. */
export const isSingleMedia = (setting: SettingDef) => ['mediaId', 'coverMediaId'].includes(setting.key)

/** Only schemaVersion 1 documents use the section registry; v2 slot documents stay JSON-only. */
export function parseDocumentV1(json: string): CmsDocumentV1 | null {
  try {
    const value = JSON.parse(json) as Partial<CmsDocumentV1>
    return value?.schemaVersion === 1 && Array.isArray(value.sections) ? (value as CmsDocumentV1) : null
  } catch {
    return null
  }
}

/** Defaults that already pass the API's draft validation wherever a value can be guessed. */
function defaultSettings(settings: SettingDef[]) {
  const result: Record<string, unknown> = {}
  for (const setting of settings) {
    if (setting.kind === 'richText') result[setting.key] = emptyRichText()
    else if (setting.kind === 'source' || setting.kind === 'talkSource') result[setting.key] = { type: 'NEWEST' }
    else if (setting.kind === 'media' && !isSingleMedia(setting)) result[setting.key] = []
    else if (setting.required && setting.kind === 'string') result[setting.key] = ''
    else if (setting.required && setting.kind === 'link') result[setting.key] = '/'
    else if (setting.required && setting.kind === 'uuidArray') result[setting.key] = []
  }
  return result
}

export const newSection = (definition: SectionDef): CmsSection => ({
  id: crypto.randomUUID(),
  type: definition.type,
  schemaVersion: definition.currentSchemaVersion,
  enabled: true,
  settings: defaultSettings(definition.settings),
  blocks: [],
})

export const newBlock = (definition: BlockDef): CmsBlock => ({
  id: crypto.randomUUID(),
  type: definition.type,
  schemaVersion: definition.schemaVersion,
  settings: defaultSettings(definition.settings),
})

export function sectionsForProfile(sections: SectionDef[], profile: ContentProfile) {
  return sections.filter((section) => section.allowedProfiles.includes(profile) && (section.builderVisible || profile.startsWith('FIXED_')))
}

/** Returns a Vietnamese reason when a value would be rejected by the API, else undefined. */
export function settingIssue(setting: SettingDef, value: unknown): string | undefined {
  if (value === undefined) return setting.required ? 'Bắt buộc' : undefined
  switch (setting.kind) {
    case 'media':
      if (isSingleMedia(setting)) return isUuid(value) ? undefined : 'Chọn một ảnh'
      return Array.isArray(value) && value.length <= 24 ? undefined : 'Tối đa 24 ảnh'
    case 'uuid':
      return isUuid(value) ? undefined : 'Chưa chọn'
    case 'string':
      if (setting.key === 'productId' && !isUuid(value)) return 'Chưa chọn sản phẩm'
      return typeof value === 'string' ? undefined : 'Không hợp lệ'
    case 'link':
      return isSafeLink(value) ? undefined : 'Liên kết phải bắt đầu bằng / hoặc https://'
    case 'integer': {
      const min = setting.minValue ?? 1
      const max = setting.maxValue ?? 48
      return Number.isInteger(value) && (value as number) >= min && (value as number) <= max ? undefined : `Từ ${min} đến ${max}`
    }
    case 'richText':
      return isRichText(value) ? undefined : 'Nội dung không hợp lệ'
    case 'uuidArray': {
      const items = Array.isArray(value) ? value : []
      if (!Array.isArray(value) || !items.every(isUuid)) return 'Danh sách ID không hợp lệ'
      return items.length >= (setting.minItems ?? 0) ? undefined : `Cần ít nhất ${setting.minItems}`
    }
    case 'source': {
      const source = value as { type?: string; productIds?: unknown; categoryId?: unknown }
      if (source.type === 'MANUAL_PRODUCTS') return Array.isArray(source.productIds) && source.productIds.length ? undefined : 'Chọn sản phẩm'
      if (source.type === 'CATEGORY') return isUuid(source.categoryId) ? undefined : 'Chọn danh mục'
      return undefined
    }
    case 'talkSource': {
      const source = value as { type?: string; talkIds?: unknown }
      return source.type !== 'MANUAL_MILI_TALKS' || (Array.isArray(source.talkIds) && source.talkIds.length) ? undefined : 'Chọn bài viết'
    }
    default:
      return undefined
  }
}

export interface DocumentIssue {
  sectionId: string
  message: string
}

/** Client-side mirror of validateCmsDocument (draft mode) for the fields the editor writes. */
export function documentIssues(doc: CmsDocumentV1, sections: SectionDef[], blocks: BlockDef[]): DocumentIssue[] {
  const issues: DocumentIssue[] = []
  doc.sections.forEach((section, index) => {
    const definition = sections.find((candidate) => candidate.type === section.type)
    const name = `Khối ${index + 1} (${sectionLabel(section.type, definition?.label)})`
    if (!definition) return issues.push({ sectionId: section.id, message: `${name}: loại khối không được hỗ trợ` })
    const check = (settings: SettingDef[], values: Record<string, unknown>, prefix: string) => {
      for (const setting of settings) {
        const problem = settingIssue(setting, values[setting.key])
        if (problem) issues.push({ sectionId: section.id, message: `${prefix} · ${settingLabel(setting.key, setting.label)}: ${problem}` })
      }
    }
    check(definition.settings, section.settings, name)
    section.blocks.forEach((block) => {
      const blockDef = blocks.find((candidate) => candidate.type === block.type)
      if (blockDef) check(blockDef.settings, block.settings, `${name} › ${sectionLabel(block.type, blockDef.label)}`)
    })
  })
  return issues
}
