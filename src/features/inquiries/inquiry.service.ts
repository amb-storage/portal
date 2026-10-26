import type { Paginated } from '@/lib/api/types'
import { SAMPLE_INQUIRIES } from './mock-data'
import type { Inquiry, InquiryListQuery, InquiryUpdate } from './types'

/**
 * Admin お問い合わせ inbox.
 *
 * MOCK: the API has no inquiry endpoints yet (see docs/CONTACT_API_PROPOSAL.md). This keeps
 * sample data in localStorage behind the same shapes the proposed routes return, so wiring the
 * real API later only means swapping each method for its `api.*` call:
 *   list   → GET   /admin/inquiries?page&limit&q&status&category
 *   get    → GET   /admin/inquiries/:id
 *   update → PATCH /admin/inquiries/:id  { status?, adminNote? }
 */
export const INQUIRIES_ARE_MOCK = true

const STORAGE_KEY = 'amb-portal:mock-inquiries'

function load(): Inquiry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as Inquiry[]
  } catch {
    // Corrupt or unavailable storage: fall back to the samples.
  }
  return structuredClone(SAMPLE_INQUIRIES)
}

function save(items: Inquiry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

const latency = () => new Promise((resolve) => setTimeout(resolve, 150))

function notFound(): never {
  throw Object.assign(new Error('Không tìm thấy liên hệ'), { code: 'INQUIRY_NOT_FOUND' })
}

export const inquiryService = {
  async list(query: InquiryListQuery): Promise<Paginated<Inquiry>> {
    await latency()
    const q = query.q?.trim().toLowerCase()
    const items = load()
      .filter((item) => !query.status || item.status === query.status)
      .filter((item) => !query.category || item.category === query.category)
      .filter((item) => !q || [item.name, item.email, item.subject, item.message, item.orderNumber ?? ''].some((value) => value.toLowerCase().includes(q)))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    const start = (query.page - 1) * query.limit
    return { items: items.slice(start, start + query.limit), total: items.length, page: query.page, limit: query.limit }
  },

  async get(id: string): Promise<Inquiry> {
    await latency()
    return load().find((item) => item.id === id) ?? notFound()
  },

  async update(id: string, body: InquiryUpdate): Promise<Inquiry> {
    await latency()
    const items = load()
    const index = items.findIndex((item) => item.id === id)
    if (index < 0) notFound()
    const now = new Date().toISOString()
    const current = items[index]
    const next: Inquiry = {
      ...current,
      ...(body.status ? { status: body.status } : {}),
      ...(body.adminNote !== undefined ? { adminNote: body.adminNote } : {}),
      repliedAt: body.status === 'REPLIED' && !current.repliedAt ? now : current.repliedAt,
      updatedAt: now,
    }
    items[index] = next
    save(items)
    return next
  },

  /** Mock only: restore the sample data. */
  async resetSamples() {
    localStorage.removeItem(STORAGE_KEY)
  },
}
