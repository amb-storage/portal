import axios from 'axios'
import { api, type UploadProgressHandler } from '@/lib/api/client'
import type { Paginated } from '@/lib/api/types'
import type { MediaAsset, MediaListQuery, UploadIntent } from './types'

/** /api/v1/admin/media/* plus the direct-to-storage upload step. */
export const mediaService = {
  list: (query: MediaListQuery) => api.get<Paginated<MediaAsset>>('/media', { ...query }),
  folders: () => api.get<{ folders: string[] }>('/media/folders'),
  createUpload: (body: { filename: string; mimeType: string; sizeBytes: number; folder?: string }) =>
    api.post<UploadIntent>('/media/uploads', body),
  finalize: (id: string) => api.post<MediaAsset>(`/media/${id}/finalize`),
  update: (id: string, body: { altJa?: string; altEn?: string }) => api.patch<MediaAsset>(`/media/${id}`, body),
  archive: (id: string) => api.post<MediaAsset>(`/media/${id}/archive`),
  /** Hard delete; 409 MEDIA_IN_USE while a product or CMS content references it. */
  remove: (id: string) => api.delete<void>(`/media/${id}`),

  /**
   * PUT to the presigned storage URL with bare axios: no cookies, no CSRF,
   * only the headers the signature requires.
   */
  async uploadToStorage(intent: UploadIntent, file: File, onProgress?: UploadProgressHandler) {
    try {
      await axios.put(intent.uploadUrl, file, { headers: intent.requiredHeaders, onUploadProgress: onProgress })
    } catch (error) {
      const status = axios.isAxiosError(error) ? error.response?.status : undefined
      throw new Error(status ? `Tải lên kho lưu trữ thất bại (${status})` : 'Tải lên kho lưu trữ thất bại (kiểm tra CORS của bucket)')
    }
  },
}
