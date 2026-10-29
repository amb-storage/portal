import { z } from 'zod'
import { emptyToNull } from '@/lib/format'
import type { StoreSettings } from './types'

const https = z.string().refine((value) => value === '' || /^https:\/\//.test(value), 'Phải là link https://')

export const settingsSchema = z.object({
  defaultCurrency: z.string().regex(/^[A-Z]{3}$/, 'Mã ISO 4217 (3 chữ in hoa)'),
  storeName: z.string().max(500),
  contactEmail: z.union([z.literal(''), z.email('Email không hợp lệ')]),
  // Same rule as the API: digits with optional +, spaces, hyphens and parentheses.
  contactPhone: z.string().trim().max(32, 'Tối đa 32 ký tự').refine((value) => value === '' || /^\+?[0-9(][0-9 ()-]{5,30}$/.test(value), 'Số điện thoại không hợp lệ, vd. 03-1234-5678'),
  instagramUrl: https,
  /** One switch: prices include 10% consumption tax (calculation and website label together). */
  taxIncluded: z.boolean(),
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
  invoiceFields: z
    .array(
      z.object({
        id: z.string(),
        labelJa: z.string().trim().min(1, 'Bắt buộc').max(255),
        labelEn: z.string().max(255),
        valueJa: z.string().trim().min(1, 'Bắt buộc').max(2000),
        valueEn: z.string().max(2000),
      }),
    )
    .max(30, 'Tối đa 30 trường'),
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
    // Older API builds do not return taxCalculationMode; NONE is the API default.
    taxIncluded: (settings.taxCalculationMode ?? 'NONE') !== 'NONE',
    socialLinks: settings.socialLinks.map(({ platform, label, href }) => ({ platform, label, href })),
    invoiceFields: settings.invoiceFields ?? [],
    contactPhone: settings.contactPhone ?? '',
  }
}

/** Full replace with CAS on `revision`; socialLinks order = position. */
export function toSettingsPayload(
  values: SettingsFormValues,
  revision: number,
  supportsInvoiceFields = true,
  supportsContactPhone = true,
) {
  const nullable = Object.fromEntries(NULLABLE.map((key) => [key, emptyToNull(values[key])]))
  return {
    expectedRevision: revision,
    defaultCurrency: values.defaultCurrency,
    taxDisplayMode: values.taxIncluded ? 'TAX_INCLUDED' : 'NONE',
    taxCalculationMode: values.taxIncluded ? 'TAX_INCLUDED' : 'NONE',
    ...nullable,
    socialLinks: values.socialLinks,
    // Older API builds reject unknown fields; only send the list when the API returned it.
    ...(supportsInvoiceFields ? { invoiceFields: values.invoiceFields } : {}),
    ...(supportsContactPhone ? { contactPhone: emptyToNull(values.contactPhone) } : {}),
  }
}
