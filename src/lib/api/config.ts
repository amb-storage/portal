/** Base URL of the admin API. Empty base means same-origin (Vite proxy in dev). */
export const API_ORIGIN = import.meta.env.VITE_API_BASE_URL ?? ''
export const ADMIN_API = `${API_ORIGIN}/api/v1/admin`

/** Public image endpoint; serves READY, non-archived media only. */
export const mediaUrl = (id: string) => `${API_ORIGIN}/api/v1/media/${id}`
