import type { ISODate } from '@/lib/api/types'

export interface Admin {
  id: string
  email: string
  displayName: string
  status: 'ACTIVE'
  roles: string[]
  permissions: string[]
  mustChangePassword: boolean
}

export interface AdminSession {
  id?: string
  createdAt: ISODate
  expiresAt: ISODate
  lastSeenAt: ISODate
}

export interface MeResponse {
  admin: Admin
  session: AdminSession
}

export interface AuthResponse extends MeResponse {
  csrfToken: string
}

export interface SessionItem {
  id: string
  createdAt: ISODate
  expiresAt: ISODate
  lastSeenAt: ISODate
  ip: string | null
  userAgent: string | null
  current: boolean
}

export interface LoginInput {
  email: string
  password: string
}

export interface ChangePasswordInput {
  currentPassword: string
  newPassword: string
}

export interface SetupInput {
  email: string
  password: string
  setupToken?: string
}
