import { Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConfirmButton } from '@/components/common/confirm-button'
import { PageHeader } from '@/components/common/page-header'
import { PublishChecklistCard } from '@/components/common/publish-checklist-card'
import { StatusBadge } from '@/components/common/status-badge'
import { DraftForm } from '@/features/cms/pages/components/draft-form'
import { PreviewDialog } from '@/features/cms/pages/components/preview-dialog'
import { VersionsTab } from '@/features/cms/pages/components/versions-tab'
import { formatDateTime } from '@/lib/format'
import { useStoryDetailPage } from '../hooks/use-story-detail-page'
import { useStoryEditor } from '../hooks/use-story-editor'
import { useStorySettingsForm } from '../hooks/use-story-settings-form'
import { storyTitle, type StoryDetail } from '../types'

function StoryEditor({ story, readOnly }: { story: StoryDetail; readOnly: boolean }) {
  const form = useStoryEditor(story)
  const published = story.status === 'PUBLISHED'
  return (
    <DraftForm
      form={form}
      readOnly={readOnly}
      profile="MILI_TALK_ARTICLE"
      hideEffectiveAt
      revisionLabel={published ? `Đang hiện trên website từ ${formatDateTime(story.publishedAt)}` : 'Chưa xuất bản: chỉ Admin thấy'}
      submitLabel={published ? 'Lưu và cập nhật website' : 'Lưu'}
      saveHint={published ? 'Bài đang xuất bản: bấm lưu là nội dung mới lên website ngay.' : undefined}
    />
  )
}

function StorySettings({ story, readOnly }: { story: StoryDetail; readOnly: boolean }) {
  const form = useStorySettingsForm(story)
  return (
    <Card>
      <CardHeader>
        <CardTitle>Đường dẫn</CardTitle>
        <CardDescription>Bài hiện ở /blog/{story.slug} trên website. Đổi slug sẽ làm link cũ không còn chạy.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="flex items-end gap-2"
          onSubmit={(event) => {
            event.preventDefault()
            void form.handleSubmit()
          }}
        >
          <fieldset disabled={readOnly} className="flex-1">
            <form.AppField name="slug">{(field) => <field.TextField label="Slug" />}</form.AppField>
          </fieldset>
          {readOnly ? null : (
            <form.AppForm>
              <form.SubmitButton requireDirty>Lưu slug</form.SubmitButton>
            </form.AppForm>
          )}
        </form>
      </CardContent>
    </Card>
  )
}

/** Mili Talks article: edited, published and archived through /admin/stories. */
export function StoryDetailPage() {
  const { story, tab, setTab, lifecycle, issuePreview, preview, setPreview, checklist, ready, canManage, canPreview } = useStoryDetailPage()
  const published = story.status === 'PUBLISHED'
  const showChecklist = tab === 'content' && !published && story.pageStatus === 'ACTIVE'

  return (
    <>
      <PageHeader
        title={
          <span className="flex flex-wrap items-center gap-3">
            {storyTitle(story)} <StatusBadge status={story.status} />
            {story.pageStatus === 'ARCHIVED' ? <StatusBadge status="ARCHIVED" /> : null}
          </span>
        }
        description={`/blog/${story.slug}`}
        actions={
          <>
            {canPreview ? (
              <Button variant="outline" disabled={issuePreview.isPending} onClick={() => issuePreview.mutate()}>
                <Eye /> Xem trước
              </Button>
            ) : null}
            {canManage && !published ? (
              <ConfirmButton
                disabled={lifecycle.isPending || !ready}
                title="Xuất bản bài viết?"
                description="Bài sẽ hiện trên trang Mili Talks của website. Sau đó mỗi lần lưu sẽ cập nhật website ngay."
                confirmLabel="Xuất bản"
                onConfirm={() => lifecycle.mutate('publish')}
              >
                {ready ? 'Xuất bản' : 'Chưa đủ điều kiện xuất bản'}
              </ConfirmButton>
            ) : null}
            {canManage && published ? (
              <ConfirmButton
                variant="outline"
                disabled={lifecycle.isPending}
                title="Gỡ bài khỏi website?"
                description="Bài không còn hiện trên website nhưng vẫn giữ nguyên trong admin, xuất bản lại được."
                confirmLabel="Gỡ khỏi website"
                onConfirm={() => lifecycle.mutate('unpublish')}
              >
                Gỡ khỏi website
              </ConfirmButton>
            ) : null}
            {canManage ? (
              <ConfirmButton
                variant="destructive"
                disabled={lifecycle.isPending}
                title="Xoá bài viết?"
                description="Bài bị gỡ khỏi website và chuyển vào lưu trữ, không sửa được nữa."
                confirmLabel="Xoá"
                onConfirm={() => lifecycle.mutate('remove')}
              >
                Xoá bài
              </ConfirmButton>
            ) : null}
          </>
        }
      />
      <div className={showChecklist ? 'grid items-start gap-6 lg:grid-cols-[1fr_300px]' : undefined}>
        <Tabs value={tab} onValueChange={setTab} className="min-w-0">
          <TabsList>
            <TabsTrigger value="content">Nội dung</TabsTrigger>
            <TabsTrigger value="versions">Phiên bản</TabsTrigger>
            <TabsTrigger value="settings">Đường dẫn</TabsTrigger>
          </TabsList>
          <TabsContent value="content" className="pt-4">
            <StoryEditor key={`${story.id}:${story.updatedAt}`} story={story} readOnly={!canManage} />
          </TabsContent>
          <TabsContent value="versions" className="pt-4">
            <VersionsTab pageId={story.pageId} canPublish={canManage} />
          </TabsContent>
          <TabsContent value="settings" className="pt-4">
            <StorySettings story={story} readOnly={!canManage} />
          </TabsContent>
        </Tabs>
        {showChecklist ? (
          <aside className="lg:sticky lg:top-44">
            <PublishChecklistCard items={checklist} onGo={() => setTab('content')} readyTitle="Sẵn sàng xuất bản" pendingTitle="Cần hoàn thành để xuất bản" />
          </aside>
        ) : null}
      </div>
      {preview ? <PreviewDialog pageId={story.pageId} preview={preview} onClose={() => setPreview(null)} /> : null}
    </>
  )
}
