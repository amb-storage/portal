import { getRouteApi } from '@tanstack/react-router'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PageHeader } from '@/components/common/page-header'
import { StatusBadge } from '@/components/common/status-badge'
import { PublishChecklistCard } from '@/components/common/publish-checklist-card'
import { BlogDraftForm } from '../components/blog-draft-form'
import { BlogPageActions } from '../components/blog-page-actions'
import { BlogPreviewDialog } from '../components/blog-preview-dialog'
import { useBlogDraftForm } from '../hooks/use-blog-draft-form'
import { useBlogPostPage } from '../hooks/use-blog-post-page'
import type { BlogPostDraft } from '../blog.types'

const route = getRouteApi('/_app/cms/stories/$postId')

function BlogDraftEditor({ postId, draft, readOnly }: { postId: string; draft: BlogPostDraft; readOnly: boolean }) {
  const form = useBlogDraftForm(postId, draft)
  return <BlogDraftForm form={form} readOnly={readOnly} revisionLabel={`Nháp v${draft.version} · lần sửa ${draft.revision}`} />
}

/** Dedicated Mili Talks article editor; the generic CMS page editor is intentionally not used here. */
export function StoryDetailPage() {
  const { postId } = route.useParams()
  const page = useBlogPostPage(postId)
  const [slug, setSlug] = useState(page.post.slug)
  const slugChanged = slug.trim() !== page.post.slug

  return (
    <>
      <PageHeader
        title={<span className="flex items-center gap-3">{page.post.draft?.titleEn || page.post.draft?.titleJa || 'Bài viết'} <Badge variant="outline">Mili Talks</Badge> <StatusBadge status={page.post.publicationStatus} /></span>}
        actions={<BlogPageActions post={page.post} canManage={page.canManage} ready={page.ready} isPending={page.lifecycle.isPending || page.updateSlug.isPending} onPreview={() => page.issuePreview.mutate()} onPublish={() => page.lifecycle.mutate('publish')} onUnpublish={() => page.lifecycle.mutate('unpublish')} onArchive={() => page.lifecycle.mutate('archive')} />}
      />
      <div className="grid items-start gap-6 lg:grid-cols-[1fr_300px]">
        <div className="grid min-w-0 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Đường dẫn bài viết</CardTitle>
              <CardDescription>Giữ slug hiện tại để bảo toàn URL; sau khi đã xuất bản, slug không thể đổi.</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-3">
              <Input value={slug} onChange={(event) => setSlug(event.target.value)} disabled={!page.canManage || Boolean(page.post.published)} />
              <Button disabled={!page.canManage || !slugChanged || page.updateSlug.isPending} onClick={() => page.updateSlug.mutate(slug.trim())}>Lưu slug</Button>
            </CardContent>
          </Card>
          {page.post.draft ? <BlogDraftEditor postId={postId} draft={page.post.draft} readOnly={!page.canManage || page.post.pageStatus !== 'ACTIVE'} /> : <p className="rounded-lg border border-dashed p-12 text-center text-sm text-muted-foreground">Bài viết này đã lưu trữ và không còn bản nháp để sửa.</p>}
        </div>
        {page.checklist.length ? <aside className="lg:sticky lg:top-44"><PublishChecklistCard items={page.checklist} onGo={() => undefined} readyTitle="Sẵn sàng xuất bản" pendingTitle="Cần hoàn thành để xuất bản" /></aside> : null}
      </div>
      {page.preview ? <BlogPreviewDialog preview={page.preview} onClose={() => page.setPreview(null)} /> : null}
    </>
  )
}
