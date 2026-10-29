import type { ISODate } from '@/lib/api/types'

export const TAX_DISPLAY_MODES = ['NONE', 'TAX_INCLUDED', 'TAX_EXCLUDED'] as const
export type TaxDisplayMode = (typeof TAX_DISPLAY_MODES)[number]

export interface SocialLink {
  platform: string
  label: string
  href: string
  position?: number
}

/** Shop-defined fixed row printed on every invoice; English may be empty (prints the Japanese). */
export interface InvoiceField {
  id: string
  labelJa: string
  labelEn: string
  valueJa: string
  valueEn: string
}

export interface StoreSettings {
  id: number
  revision: number
  defaultCurrency: string
  storeName: string | null
  contactEmail: string | null
  instagramUrl: string | null
  taxDisplayMode: TaxDisplayMode
  /** Money for newly created Orders; separate from the display-only taxDisplayMode. */
  taxCalculationMode: TaxDisplayMode
  taxNoteJa: string | null
  taxNoteEn: string | null
  footerTextJa: string | null
  footerTextEn: string | null
  seoTitleJa: string | null
  seoTitleEn: string | null
  seoDescriptionJa: string | null
  seoDescriptionEn: string | null
  socialLinks: SocialLink[]
  /** Missing on API builds before invoice fields existed. */
  invoiceFields?: InvoiceField[]
  createdAt: ISODate
  updatedAt: ISODate
}
