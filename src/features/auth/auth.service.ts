import { api } from '@/lib/api/client'
import { csrf } from '@/lib/api/csrf'
import type { AuthResponse, ChangePasswordInput, LoginInput, MeResponse, SessionItem, SetupInput } from './types'

/** /api/v1/admin/auth/* endpoints. */
export const authService = {
  setupStatus: () => api.get<{ available: boolean }>('/auth/setup-status'),
  /** No session exists yet; production also requires the operator setup token. */
  setup: ({ setupToken, ...body }: SetupInput) =>
    api.post<unknown>('/auth/setup', body, { csrf: false, headers: setupToken ? { 'X-Admin-Setup-Token': setupToken } : undefined }),
  me: () => api.get<MeResponse>('/auth/me'),
  sessions: () => api.get<{ items: SessionItem[] }>('/auth/sessions'),
  async login(input: LoginInput) {
    const result = await api.post<AuthResponse>('/auth/login', input, { csrf: false })
    csrf.set(result.csrfToken)
    return result
  },
  async changePassword(input: ChangePasswordInput) {
    const result = await api.post<AuthResponse>('/auth/change-password', input)
    csrf.set(result.csrfToken)
    return result
  },
  async logout() {
    await api.post('/auth/logout')
    csrf.clear()
  },
  async logoutAll() {
    await api.post('/auth/logout-all')
    csrf.clear()
  },
  revokeSession: (id: string) => api.delete<void>(`/auth/sessions/${id}`),
}
