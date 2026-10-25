import { api } from '@/lib/api/client'
import type { StoreSettings } from './types'

/** /api/v1/admin/store-settings (singleton, CAS on expectedRevision). */
export const storeSettingsService = {
  get: () => api.get<StoreSettings>('/store-settings'),
  update: (body: Record<string, unknown>) => api.put<StoreSettings>('/store-settings', body),
}
