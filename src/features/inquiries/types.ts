import type { ISODate } from '@/lib/api/types'

export const INQUIRY_STATUSES = ['NEW', 'READ', 'REPLIED', 'ARCHIVED'] as const
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number]

/** Topics offered by the website's お問い合わせ form. */
export const INQUIRY_CATEGORIES = ['PRODUCT', 'BUYING', 'ORDER', 'FEEDBACK', 'OTHER'] as const
export type InquiryCategory = (typeof INQUIRY_CATEGORIES)[number]

export const INQUIRY_CATEGORY_LABELS: Record<InquiryCategory, string> = {
  PRODUCT: 'Hỏi về sản phẩm',
  BUYING: 'Thu mua (買取)',
  ORDER: 'Đơn hàng',
  FEEDBACK: 'Góp ý',
  OTHER: 'Khác',
}

export interface Inquiry {
  id: string
  name: string
  email: string
  category: InquiryCategory
  subject: string
  message: string
  /** Website language the customer wrote from. */
  locale: 'ja' | 'en'
  orderNumber: string | null
  status: InquiryStatus
  adminNote: string | null
  createdAt: ISODate
  updatedAt: ISODate
  repliedAt: ISODate | null
}

export interface InquiryListQuery {
  page: number
  limit: number
  q?: string
  status?: InquiryStatus
  category?: InquiryCategory
}

export interface InquiryUpdate {
  status?: InquiryStatus
  adminNote?: string | null
}
