/** Category rows are returned raw from SQL (snake_case). Only ACTIVE categories are listed. */
export interface Category {
  id: string
  slug: string
  name_ja: string
  name_en: string
  description_ja: string | null
  description_en: string | null
  position: number
  status: string
}

export interface CategoryListQuery {
  page: number
  limit: number
}

export interface CategoryFormValues {
  slug: string
  nameJa: string
  nameEn: string
  descriptionJa: string
  descriptionEn: string
  position?: number
}
