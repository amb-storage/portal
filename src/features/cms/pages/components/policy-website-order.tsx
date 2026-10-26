import { useQueries } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { fixedContentQuery } from '../queries'
import type { PageListRow } from '../types'
import { policySectionDomId } from '../scroll'

interface Entry {
  pageId: string
  slug: string
  published: boolean
  anchorKey: string
  title: string
}

/**
 * Preview of the website's /policy menu: every POLICY page ordered by slug (as the public API
 * lists them), each section numbered in turn. Built from drafts, so unpublished pages are flagged.
 */
export function PolicyWebsiteOrder({ pages }: { pages: PageListRow[] }) {
  const sorted = [...pages].sort((a, b) => (a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0))
  const results = useQueries({ queries: sorted.map((page) => fixedContentQuery(page.id)) })
  if (sorted.length === 0) return null

  const entries: Entry[] = sorted.flatMap((page, index) => {
    const content = results[index]?.data?.content
    const sections = content?.schemaVersion === 2 && Array.isArray(content.sections) ? (content.sections as Array<{ settings: Record<string, unknown> }>) : []
    return sections.map((section) => ({
      pageId: page.id,
      slug: page.slug,
      published: Boolean(page.published_id),
      anchorKey: String(section.settings.anchorKey ?? ''),
      title: String(section.settings.titleJa ?? ''),
    }))
  })
  const unstructured = sorted.filter((_, index) => results[index]?.data && entries.every((entry) => entry.pageId !== sorted[index].id))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thứ tự trên website (/policy)</CardTitle>
        <CardDescription>
          Mục lục trang /policy ghép từ các chính sách theo slug A→Z. Danh sách này lấy từ bản nháp; chỉ trang đã xuất bản mới hiện trên website. Bấm một mục để mở đúng chỗ đó.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {results.some((result) => result.isPending) ? (
          <Skeleton className="h-24" />
        ) : (
          <ol className="grid gap-1 text-sm md:grid-cols-2">
            {entries.map((entry, index) => (
              <li key={`${entry.pageId}-${entry.anchorKey}-${index}`} className="flex items-baseline gap-2">
                <span className="w-6 shrink-0 text-muted-foreground tabular-nums">{index + 1}.</span>
                <Link
                  to="/cms/policies/$pageId"
                  params={{ pageId: entry.pageId }}
                  hash={policySectionDomId(entry.anchorKey)}
                  className="min-w-0 truncate underline-offset-4 hover:text-primary hover:underline"
                >
                  {entry.title || '(chưa đặt tiêu đề)'}
                </Link>
                <Badge variant="outline" className="shrink-0 font-normal text-muted-foreground">
                  {entry.slug}
                  {entry.published ? '' : ' · chưa xuất bản'}
                </Badge>
              </li>
            ))}
          </ol>
        )}
        {unstructured.length > 0 ? (
          <p className="text-xs text-muted-foreground">Chưa chia mục: {unstructured.map((page) => page.slug).join(', ')}. Mở trang để điền nội dung.</p>
        ) : null}
      </CardContent>
    </Card>
  )
}
