import { keepPreviousData, queryOptions } from '@tanstack/react-query'
import { storyService } from './story.service'
import type { StoryListQuery } from './types'

export const storyKeys = {
  all: ['cms', 'stories'] as const,
  list: (query: StoryListQuery) => [...storyKeys.all, 'list', query] as const,
}

export const storyListQuery = (query: StoryListQuery) =>
  queryOptions({ queryKey: storyKeys.list(query), queryFn: () => storyService.list(query), placeholderData: keepPreviousData })
