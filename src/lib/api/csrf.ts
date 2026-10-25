import axios from 'axios'
import { ADMIN_API } from './config'
import { ApiError } from './errors'

/**
 * CSRF token lives only in memory. Login returns one; after a reload we rotate
 * a fresh token via POST /auth/csrf (session cookie + Origin are enough).
 * Uses bare axios (not the `http` instance) to avoid interceptor recursion.
 */
let token: string | null = null
let pending: Promise<string> | null = null

async function rotate(): Promise<string> {
  try {
    const { data } = await axios.post<{ csrfToken: string | null }>(`${ADMIN_API}/auth/csrf`, {}, {
      withCredentials: true,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    })
    if (!data.csrfToken) throw new ApiError(401, { statusCode: 401, code: 'UNAUTHORIZED', message: 'Phiên đăng nhập đã hết hạn' })
    token = data.csrfToken
    return token
  } catch (error) {
    if (axios.isAxiosError(error)) throw new ApiError(error.response?.status ?? 0, error.response?.data)
    throw error
  }
}

export const csrf = {
  set(next: string | null) {
    token = next
  },
  clear() {
    token = null
  },
  async ensure(): Promise<string> {
    if (token) return token
    pending ??= rotate().finally(() => {
      pending = null
    })
    return pending
  },
}
