/** Mirrors the API's schemaVersion 1 CMS document (content-validator.ts). */
export interface RichNode {
  type: string
  text?: string
  attrs?: Record<string, unknown>
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>
  content?: RichNode[]
}

export interface CmsBlock {
  id: string
  type: string
  schemaVersion: number
  settings: Record<string, unknown>
}

export interface CmsSection {
  id: string
  type: string
  schemaVersion: number
  enabled: boolean
  settings: Record<string, unknown>
  blocks: CmsBlock[]
}

export interface CmsDocumentV1 {
  schemaVersion: 1
  sections: CmsSection[]
}

export type SettingKind = 'enum' | 'media' | 'string' | 'richText' | 'source' | 'talkSource' | 'integer' | 'uuid' | 'link' | 'uuidArray'

export interface SettingDef {
  key: string
  kind: SettingKind
  label: string
  values?: string[]
  required?: boolean
  minItems?: number
  maxItems?: number
  minValue?: number
  maxValue?: number
}

export interface SectionDef {
  type: string
  currentSchemaVersion: number
  label: string
  category: string
  settings: SettingDef[]
  allowedBlocks: string[]
  maxBlocks: number
  allowedProfiles: string[]
  builderVisible: boolean
}

export interface BlockDef {
  type: string
  schemaVersion: number
  label: string
  settings: SettingDef[]
}

export type ContentProfile = 'PAGE_BUILDER' | 'MILI_TALK_ARTICLE' | 'MILI_TALKS_LANDING' | 'HOME_BUILDER' | 'FIXED_ABOUT' | 'FIXED_POLICY'
