import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { PageHeader } from '@/components/common/page-header'
import { ErrorAlert, LoadingBlock } from '@/components/common/query-state'
import { CmsPageDetail } from '@/features/cms/pages/pages/cms-page-detail-page'
import { pageListQuery } from '@/features/cms/pages/queries'

import { MILI_TALKS_LANDING_SLUG } from '../mili-talks-template'

const route = getRouteApi('/_app/cms/mili-talks')

/** The Mili Talks blog home: edited in place, like About. */
export function MiliTalksLandingPage() {
  const { tab } = route.useSearch()
  const navigate = route.useNavigate()
  const landing = useQuery(pageListQuery({ page: 1, limit: 20, type: 'LANDING', status: 'ACTIVE', q: MILI_TALKS_LANDING_SLUG }))
  const page = landing.data?.items.find((row) => row.slug === MILI_TALKS_LANDING_SLUG)

  if (page) return <CmsPageDetail pageId={page.id} tab={tab} onTabChange={(next) => navigate({ search: { tab: next }, replace: true })} />
  return (
    <>
      <PageHeader title="Trang chủ blog" description="Trang danh sách Mili Talks trên website." />
      <ErrorAlert error={landing.error} />
      {landing.isPending ? (
        <LoadingBlock />
      ) : (
        <p className="rounded-lg border border-dashed p-12 text-center text-sm text-muted-foreground">
          Chưa có trang <code>mili-talks</code>. Trang này được tạo khi khởi tạo CMS (lệnh <code>cms:bootstrap-content</code> ở backend).
        </p>
      )}
    </>
  )
}
