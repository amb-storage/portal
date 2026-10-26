import { getRouteApi } from '@tanstack/react-router'
import { CmsPageDetail } from './cms-page-detail-page'

const route = getRouteApi('/_app/cms/policies/$pageId')

export function PolicyDetailPage() {
  const { pageId } = route.useParams()
  const { tab } = route.useSearch()
  const navigate = route.useNavigate()
  return <CmsPageDetail pageId={pageId} tab={tab} onTabChange={(next) => navigate({ search: { tab: next }, replace: true })} />
}
