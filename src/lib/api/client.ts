import type { AxiosProgressEvent } from 'axios'
import { http } from './http'
import type { QueryParams } from './types'

interface MutationOptions {
  /** Mutations send X-CSRF-Token by default; login and first-time setup are the exceptions. */
  csrf?: boolean
  headers?: Record<string, string>
}

/** Thin typed wrapper so services never touch AxiosResponse. */
export const api = {
  get: <T>(path: string, params?: QueryParams) => http.get<T>(path, { params }).then((response) => response.data),
  post: <T>(path: string, body?: unknown, options?: MutationOptions) =>
    http.post<T>(path, body, { skipCsrf: options?.csrf === false, headers: options?.headers }).then((response) => response.data),
  put: <T>(path: string, body?: unknown) => http.put<T>(path, body).then((response) => response.data),
  patch: <T>(path: string, body?: unknown) => http.patch<T>(path, body).then((response) => response.data),
  delete: <T>(path: string) => http.delete<T>(path).then((response) => response.data),
}

export type UploadProgressHandler = (event: AxiosProgressEvent) => void
