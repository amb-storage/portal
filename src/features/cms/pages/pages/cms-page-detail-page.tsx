import { getRouteApi } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { statusLabel } from '@/lib/labels'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/components/common/page-header'
import { PublishChecklistCard } from '@/components/common/publish-checklist-card'
import { StatusBadge } from '@/components/common/status-badge'
import { DraftTab } from '../components/draft-tab'
import { PageActions } from '../components/page-actions'
import { PreviewDialog } from '../components/preview-dialog'
import { RegistryTab } from '../components/registry-tab'
import { SettingsTab } from '../components/settings-tab'
import { VersionsTab } from '../components/versions-tab'
import { isMiliTalksLanding } from '@/features/cms/stories/mili-talks-template'
import { useCmsPageDetailPage, type CmsPageDetailOptions } from '../hooks/use-cms-page-detail-page'

const route = getRouteApi('/_app/cms/pages/$pageId')

/** Generic Pages screen (HOME/STANDARD/LANDING and Story pages). ABOUT/POLICY are redirected away by the route. */
export function CmsPageDetailPage() {
  const { pageId } = route.useParams()
  const { tab } = route.useSearch()
  const navigate = route.useNavigate()
  return <CmsPageDetail pageId={pageId} tab={tab} onTabChange={(next) => navigate({ search: { tab: next }, replace: true })} />
}

export function CmsPageDetail(options: CmsPageDetailOptions) {
  const { page, draft, tab, setTab, lifecycle, issuePreview, preview, setPreview, canEdit, canPublish, canPreview, checklist, ready } =
    useCmsPageDetailPage(options)
  // About/Policy and the Mili Talks blog home have their own editors: the section registry does not apply.
  const isFixed = page.type === 'ABOUT' || page.type === 'POLICY' || isMiliTalksLanding(page)
  // About is resolved by type on the website, so its slug is not worth editing.
  const showSettings = page.type !== 'ABOUT' && !isMiliTalksLanding(page)
  const showChecklist = tab === 'draft' && page.status === 'ACTIVE' && checklist.length > 0

  return (
    <>
      <PageHeader
        title={
          <span className="flex items-center gap-3">
            {page.slug} <Badge variant="outline">{statusLabel(page.type)}</Badge> <StatusBadge status={page.status} />
            {page.publishedVersionId ? <StatusBadge status="PUBLISHED" /> : null}
          </span>
        }
        actions={
          <PageActions
            page={page}
            hasDraft={Boolean(draft.data)}
            canEdit={canEdit}
            canPublish={canPublish}
            canPreview={canPreview}
            ready={ready}
            isPending={lifecycle.isPending}
            onAction={(action) => lifecycle.mutate(action)}
            onPreview={() => issuePreview.mutate()}
          />
        }
      />
      <div className={showChecklist ? 'grid items-start gap-6 lg:grid-cols-[1fr_300px]' : undefined}>
        <Tabs value={tab} onValueChange={setTab} className="min-w-0">
          <TabsList>
            <TabsTrigger value="draft">Nháp</TabsTrigger>
            <TabsTrigger value="versions">Phiên bản</TabsTrigger>
            {showSettings ? <TabsTrigger value="settings">Cài đặt</TabsTrigger> : null}
            {isFixed ? null : <TabsTrigger value="registry">Cấu trúc section</TabsTrigger>}
          </TabsList>
          <TabsContent value="draft" className="pt-4">
            <DraftTab page={page} draft={draft} readOnly={!canEdit} />
          </TabsContent>
          <TabsContent value="versions" className="pt-4">
            <VersionsTab pageId={page.id} canPublish={canPublish} />
          </TabsContent>
          <TabsContent value="settings" className="pt-4">
            <SettingsTab page={page} canEdit={canEdit} />
          </TabsContent>
          <TabsContent value="registry" className="pt-4">
            <RegistryTab />
          </TabsContent>
        </Tabs>
        {showChecklist ? (
          <aside className="lg:sticky lg:top-44">
            <PublishChecklistCard
              items={checklist}
              onGo={() => setTab('draft')}
              readyTitle="Sẵn sàng xuất bản"
              pendingTitle="Cần hoàn thành để xuất bản"
            />
          </aside>
        ) : null}
      </div>
      {preview ? <PreviewDialog pageId={page.id} preview={preview} onClose={() => setPreview(null)} /> : null}
    </>
  )
}
