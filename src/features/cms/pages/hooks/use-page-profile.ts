import { useQuery } from '@tanstack/react-query'
import type { ContentProfile } from '@/features/cms/editor/types'
import { storyListQuery } from '@/features/cms/stories/queries'
import type { CmsPage } from '../types'

/** Mirrors resolveContentProfile on the API (Story pages are MILI_TALK_ARTICLE). */
export function usePageProfile(page: CmsPage): ContentProfile {
  const stories = useQuery({ ...storyListQuery({ page: 1, limit: 20, q: page.slug }), enabled: page.type === 'STANDARD' })
  if (page.type === 'HOME') return 'HOME_BUILDER'
  if (page.type === 'ABOUT') return 'FIXED_ABOUT'
  if (page.type === 'POLICY') return 'FIXED_POLICY'
  return stories.data?.items.some((story) => story.pageId === page.id) ? 'MILI_TALK_ARTICLE' : 'PAGE_BUILDER'
}
