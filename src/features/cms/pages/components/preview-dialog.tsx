import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Copy } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { JsonView } from '@/components/common/json-view'
import { ErrorAlert, LoadingBlock } from '@/components/common/query-state'
import { SectionPreview, type PreviewLang } from '@/features/cms/editor/section-preview'
import type { CmsSection } from '@/features/cms/editor/types'
import { cn } from '@/lib/utils'
import { cmsPageService } from '../cms-page.service'
import type { PageVersion, PreviewToken } from '../types'

/** Renders the token-bound draft as readers would see it; the raw token stays available for developers. */
export function PreviewDialog({ pageId, preview, onClose }: { pageId: string; preview: PreviewToken; onClose: () => void }) {
  const [lang, setLang] = useState<PreviewLang>('ja')
  const result = useQuery({
    queryKey: ['cms', 'preview', pageId, preview.draftVersionId],
    queryFn: () => cmsPageService.preview(pageId, preview.token) as Promise<{ draft: PageVersion }>,
    staleTime: Infinity,
    retry: false,
  })
  const draft = result.data?.draft
  const content = draft?.content as { schemaVersion?: number; sections?: CmsSection[] } | undefined
  const title = lang === 'ja' ? draft?.titleJa : draft?.titleEn

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[92vh] flex-col gap-4 sm:max-w-4xl">
        <DialogHeader className="flex-row items-center justify-between gap-4 pr-8">
          <div className="grid gap-1">
            <DialogTitle>Xem trước bản nháp</DialogTitle>
            <DialogDescription>Theo bản nháp đã lưu, hiển thị gần đúng với website. Mã xem trước hết hạn sau {Math.round(preview.expiresInSeconds / 60)} phút.</DialogDescription>
          </div>
          <div className="inline-flex shrink-0 rounded-lg border bg-muted/40 p-0.5 text-sm">
            {(['ja', 'en'] as const).map((value) => (
              <button key={value} type="button" onClick={() => setLang(value)} className={cn('rounded-md px-3 py-1 text-muted-foreground', lang === value && 'bg-background text-foreground shadow-xs')}>
                {value === 'ja' ? 'Tiếng Nhật' : 'Tiếng Anh'}
              </button>
            ))}
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border bg-background">
          <ErrorAlert error={result.error} />
          {result.isPending ? <div className="p-6"><LoadingBlock /></div> : null}
          {draft ? (
            <article className="mx-auto grid max-w-3xl gap-8 px-6 py-8">
              <h1 className="text-3xl font-semibold tracking-tight">{title || <span className="text-muted-foreground">Chưa có tiêu đề</span>}</h1>
              {content?.schemaVersion === 1 ? (
                content.sections?.filter((section) => section.enabled).map((section) => <SectionPreview key={section.id} section={section} lang={lang} />)
              ) : (
                <JsonView value={content} />
              )}
              {content?.schemaVersion === 1 && !content.sections?.some((section) => section.enabled) ? (
                <p className="text-sm text-muted-foreground">Bản nháp chưa có khối nội dung nào đang hiển thị.</p>
              ) : null}
            </article>
          ) : null}
        </div>

        <details className="text-sm">
          <summary className="cursor-pointer text-muted-foreground">Dành cho lập trình viên: mã xem trước</summary>
          <div className="mt-2 grid gap-2">
            <div className="flex min-w-0 gap-2">
              <code className="min-w-0 flex-1 truncate rounded-md border bg-muted/40 px-2 py-1.5 text-xs">{preview.token}</code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void navigator.clipboard.writeText(preview.token).then(() => toast.success('Đã sao chép mã'))}
              >
                <Copy /> Sao chép
              </Button>
            </div>
            <p className="text-xs break-all text-muted-foreground">
              Gửi qua header <code>X-CMS-Preview-Token</code> tới <code>GET /api/v1/cms/preview/pages/{pageId}</code>. Gắn với bản nháp{' '}
              <code>{preview.draftVersionId.slice(0, 8)}</code>; lưu nháp mới sẽ làm mã cũ hết hiệu lực.
            </p>
          </div>
        </details>
      </DialogContent>
    </Dialog>
  )
}
