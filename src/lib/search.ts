import { z } from 'zod'

/** Reusable route-search fields; invalid values fall back instead of throwing. */
export const pageParam = z.number().int().min(1).default(1).catch(1)
export const optionalText = z.string().trim().min(1).optional().catch(undefined)

export function optionalEnum<const T extends readonly [string, ...string[]]>(values: T) {
  return z.enum(values).optional().catch(undefined)
}

export const LIST_LIMIT = 20
