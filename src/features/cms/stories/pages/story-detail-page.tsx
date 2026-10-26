import { getRouteApi } from '@tanstack/react-router'
import { CmsPageDetail } from '@/features/cms/pages/pages/cms-page-detail-page'

const route = getRouteApi('/_app/cms/stories/$pageId')

/** A Mili Talks article: the shared page editor, under the blog's own route and breadcrumb. */
export function StoryDetailPage() {
  const { pageId } = route.useParams()
  const { tab } = route.useSearch()
  const navigate = route.useNavigate()
  return <CmsPageDetail pageId={pageId} tab={tab} onTabChange={(next) => navigate({ search: { tab: next }, replace: true })} />
}
