import { ERROR_MESSAGES } from '@/lib/labels'

/** Standard error envelope returned by the API's HttpErrorFilter. */
export interface ApiErrorBody {
  statusCode: number
  code: string
  message: string | string[]
  requestId?: string
  timestamp?: string
  path?: string
}

function isErrorBody(value: unknown): value is ApiErrorBody {
  return typeof value === 'object' && value !== null && 'code' in value && 'message' in value
}

export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly requestId?: string

  constructor(status: number, body: unknown) {
    const parsed = isErrorBody(body) ? body : undefined
    const message = Array.isArray(parsed?.message) ? parsed.message.join('; ') : parsed?.message
    super(message ?? (status === 0 ? 'Lỗi mạng: không kết nối được máy chủ' : `Yêu cầu thất bại (mã ${status})`))
    this.name = 'ApiError'
    this.status = status
    this.code = parsed?.code ?? 'HTTP_ERROR'
    this.requestId = parsed?.requestId
  }

  get isConflict() {
    return this.status === 409
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

/** Human-readable description for toasts; never includes internal details. */
export function describeError(error: unknown): string {
  if (!isApiError(error)) return error instanceof Error ? error.message : 'Lỗi không xác định'
  const known = ERROR_MESSAGES[error.code]
  if (known) return known
  // Only concurrency conflicts benefit from reloading; other 409s are business-rule failures.
  const hint = error.isConflict && /CONFLICT|STALE/.test(error.code) ? ' Hãy tải lại dữ liệu mới nhất rồi thử lại.' : ''
  return `${error.message} (${error.code})${hint}`
}
