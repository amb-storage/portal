import { z } from 'zod'
import { emptyToNull } from '@/lib/format'
import { TAX_DISPLAY_MODES, type StoreSettings } from './types'

const https = z.string().refine((value) => value === '' || /^https:\/\//.test(value), 'Phải là link https://')

export const settingsSchema = z.object({
  defaultCurrency: z.string().regex(/^[A-Z]{3}$/, 'Mã ISO 4217 (3 chữ in hoa)'),
  storeName: z.string().max(500),
  contactEmail: z.union([z.literal(''), z.email('Email không hợp lệ')]),
  instagramUrl: https,
  taxDisplayMode: z.enum(TAX_DISPLAY_MODES),
  taxNoteJa: z.string().max(5000),
  taxNoteEn: z.string().max(5000),
  footerTextJa: z.string().max(5000),
  footerTextEn: z.string().max(5000),
  seoTitleJa: z.string().max(5000),
  seoTitleEn: z.string().max(5000),
  seoDescriptionJa: z.string().max(10000),
  seoDescriptionEn: z.string().max(10000),
  socialLinks: z.array(
    z.object({
      platform: z.string().regex(/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/, 'lowercase, e.g. instagram'),
      label: z.string().min(1, 'Bắt buộc').max(255),
      href: https.refine((value) => value !== '', 'Bắt buộc'),
    }),
  ),
})

export type SettingsFormValues = z.infer<typeof settingsSchema>

const NULLABLE = [
  'storeName', 'contactEmail', 'instagramUrl', 'taxNoteJa', 'taxNoteEn', 'footerTextJa', 'footerTextEn',
  'seoTitleJa', 'seoTitleEn', 'seoDescriptionJa', 'seoDescriptionEn',
] as const

export function toSettingsValues(settings: StoreSettings): SettingsFormValues {
  const values = Object.fromEntries(NULLABLE.map((key) => [key, settings[key] ?? '']))
  return {
    ...(values as Record<(typeof NULLABLE)[number], string>),
    defaultCurrency: settings.defaultCurrency,
    taxDisplayMode: settings.taxDisplayMode,
    socialLinks: settings.socialLinks.map(({ platform, label, href }) => ({ platform, label, href })),
  }
}

/** Full replace with CAS on `revision`; socialLinks order = position. */
export function toSettingsPayload(values: SettingsFormValues, revision: number) {
  const nullable = Object.fromEntries(NULLABLE.map((key) => [key, emptyToNull(values[key])]))
  return {
    expectedRevision: revision,
    defaultCurrency: values.defaultCurrency,
    taxDisplayMode: values.taxDisplayMode,
    ...nullable,
    socialLinks: values.socialLinks,
  }
}
