import { MediaThumb } from '@/components/common/media-thumb'
import { cn } from '@/lib/utils'
import { sectionLabel } from './labels'
import { RichTextView } from './rich-text-view'
import type { CmsBlock, CmsSection } from './types'

export type PreviewLang = 'ja' | 'en'

const str = (value: unknown) => (typeof value === 'string' ? value : '')
const pick = (settings: Record<string, unknown>, base: string, lang: PreviewLang) => settings[`${base}${lang === 'ja' ? 'Ja' : 'En'}`]
const WIDTH: Record<string, string> = { NARROW: 'max-w-xl', STANDARD: 'max-w-3xl', WIDE: 'max-w-none' }

function Image({ id, className }: { id: unknown; className?: string }) {
  return typeof id === 'string' ? <MediaThumb id={id} status="READY" fit="contain" className={cn('w-full bg-muted/40', className)} /> : null
}

function Block({ block, lang }: { block: CmsBlock; lang: PreviewLang }) {
  if (block.type === 'RICH_TEXT') return <RichTextView value={block.settings.body} />
  if (block.type === 'CTA') {
    const variant = str(block.settings.variant)
    return (
      <span className={cn('inline-flex w-fit rounded-md px-4 py-2 text-sm font-medium', variant === 'TEXT' ? 'text-primary underline' : variant === 'SECONDARY' ? 'border' : 'bg-primary text-primary-foreground')}>
        {str(pick(block.settings, 'label', lang)) || 'Nút'}
      </span>
    )
  }
  return null
}

/** Approximates how a v1 section reads on the storefront; commerce sections render as labelled placeholders. */
export function SectionPreview({ section, lang }: { section: CmsSection; lang: PreviewLang }) {
  const s = section.settings
  const blocks = section.blocks.map((block) => <Block key={block.id} block={block} lang={lang} />)
  switch (section.type) {
    case 'TALK_HEADER':
      return (
        <div className="grid gap-4">
          <Image id={s.coverMediaId} className="max-h-[420px] rounded-lg" />
          <p className="text-lg text-muted-foreground">{str(pick(s, 'excerpt', lang))}</p>
        </div>
      )
    case 'RICH_TEXT':
      return <div className={cn('mx-auto w-full', WIDTH[str(s.width)] ?? WIDTH.STANDARD)}><RichTextView value={s.body} /></div>
    case 'LOCALIZED_RICH_TEXT':
      return <RichTextView value={pick(s, 'body', lang)} />
    case 'IMAGE':
      return <figure className={cn('mx-auto grid w-full gap-2', WIDTH[str(s.width)] ?? WIDTH.STANDARD)}><Image id={s.mediaId} className="rounded-lg" />{s.alt ? <figcaption className="text-center text-xs text-muted-foreground">{str(s.alt)}</figcaption> : null}</figure>
    case 'IMAGE_WITH_TEXT':
      return (
        <div className={cn('grid items-center gap-6 md:grid-cols-2', s.imagePosition === 'RIGHT' && 'md:[&>*:first-child]:order-2')}>
          <Image id={s.mediaId} className="rounded-lg" />
          <div className="grid gap-3">{blocks}</div>
        </div>
      )
    case 'GALLERY':
      return (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {(Array.isArray(s.mediaIds) ? s.mediaIds : []).map((id) => <Image key={String(id)} id={id} className="aspect-square rounded-md" />)}
        </div>
      )
    case 'QUOTE':
      return (
        <blockquote className="mx-auto grid max-w-2xl gap-2 border-l-4 border-primary pl-5 text-lg italic">
          “{str(s.text)}”{s.attribution ? <span className="text-sm not-italic text-muted-foreground">— {str(s.attribution)}</span> : null}
        </blockquote>
      )
    case 'CONTACT':
      return <div className="grid gap-3"><h2 className="text-xl font-semibold">{str(pick(s, 'heading', lang))}</h2><RichTextView value={pick(s, 'body', lang)} /></div>
    case 'HERO':
      return <div className={cn('grid gap-3 rounded-lg bg-accent p-10', s.alignment === 'CENTER' && 'justify-items-center text-center', s.alignment === 'RIGHT' && 'justify-items-end text-right')}>{blocks}</div>
    case 'DIVIDER':
      return <hr className="border-border" />
    case 'SPACER':
      return <div className={s.spacing === 'LARGE' ? 'h-16' : s.spacing === 'SMALL' ? 'h-4' : 'h-8'} />
    default:
      return (
        <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          {sectionLabel(section.type)} — nội dung lấy từ dữ liệu cửa hàng, hiển thị trên website.
        </div>
      )
  }
}
