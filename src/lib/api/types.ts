export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  limit: number
}

export type QueryParams = Record<string, string | number | boolean | null | undefined>

export type ISODate = string
