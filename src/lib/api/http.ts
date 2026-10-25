import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { ADMIN_API } from './config'
import { csrf } from './csrf'
import { ApiError } from './errors'
import { emitSessionExpired } from './session-events'

declare module 'axios' {
  interface AxiosRequestConfig {
    /** Only login and first-time setup skip CSRF (no session exists yet). */
    skipCsrf?: boolean
    /** Set internally after one CSRF rotate-and-retry. */
    _retried?: boolean
  }
}

/** Axios instance for the Admin API: session cookie + Origin + CSRF guards. */
export const http = axios.create({
  baseURL: ADMIN_API,
  withCredentials: true,
  headers: { Accept: 'application/json' },
})

http.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  if (config.method?.toLowerCase() === 'get') return config
  // AdminRequestSecurityGuard requires a JSON content type on every mutation, DELETE included.
  config.headers.set('Content-Type', 'application/json')
  config.data ??= {}
  if (!config.skipCsrf) config.headers.set('X-CSRF-Token', await csrf.ensure())
  return config
})

http.interceptors.response.use(undefined, async (error: AxiosError) => {
  const config = error.config
  const apiError = new ApiError(error.response?.status ?? 0, error.response?.data)

  if (config && !config._retried && !config.skipCsrf && apiError.code === 'CSRF_INVALID') {
    csrf.clear()
    return http({ ...config, _retried: true })
  }
  if (apiError.status === 401 && !config?.skipCsrf) emitSessionExpired()
  throw apiError
})
