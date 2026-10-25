import { z } from 'zod'
import { optionalEnum, optionalText, pageParam } from '@/lib/search'
import { STORY_STATUSES } from './types'

export const storySearchSchema = z.object({
  page: pageParam,
  q: optionalText,
  status: optionalEnum(STORY_STATUSES),
})

export type StorySearch = z.infer<typeof storySearchSchema>
