import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { JsonView } from '@/components/common/json-view'
import { SectionPreview, type PreviewLang } from '@/features/cms/editor/section-preview'
import type { CmsSection } from '@/features/cms/editor/types'
import { cn } from '@/lib/utils'
import type { BlogPreview } from '../blog.types'

export function BlogPreviewDialog({ preview, onClose }: { preview: BlogPreview; onClose: () => void }) {
  const [lang, setLang] = useState<PreviewLang>('ja')
  const content = preview.draft.content as { schemaVersion?: number; sections?: CmsSection[] }
  const title = lang === 'ja' ? preview.draft.titleJa : preview.draft.titleEn
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[92vh] flex-col gap-4 sm:max-w-4xl">
        <DialogHeader className="flex-row items-center justify-between gap-4 pr-8">
          <div className="grid gap-1">
            <DialogTitle>Xem trước bài viết</DialogTitle>
            <DialogDescription>Bản nháp đã lưu, hiển thị gần đúng với website.</DialogDescription>
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
          <article className="mx-auto grid max-w-3xl gap-8 px-6 py-8">
            <h1 className="text-3xl font-semibold tracking-tight">{title || <span className="text-muted-foreground">Chưa có tiêu đề</span>}</h1>
            {content.schemaVersion === 1 ? (
              content.sections?.filter((section) => section.enabled).map((section) => <SectionPreview key={section.id} section={section} lang={lang} />)
            ) : (
              <JsonView value={content} />
            )}
            {content.schemaVersion === 1 && !content.sections?.some((section) => section.enabled) ? <p className="text-sm text-muted-foreground">Bản nháp chưa có nội dung đang hiển thị.</p> : null}
          </article>
        </div>
      </DialogContent>
    </Dialog>
  )
}
