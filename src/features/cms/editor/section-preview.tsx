import { MediaThumb } from '@/components/common/media-thumb'
import { cn } from '@/lib/utils'
import { sectionLabel } from './labels'
import { RichTextView } from './rich-text-view'
import type { CmsBlock, CmsSection } from './types'

export type PreviewLang = 'ja' | 'en'

const str = (value: unknown) => (typeof value === 'string' ? value : '')
const pick = (settings: Record<string, unknown>, base: string, lang: PreviewLang) => settings[`${base}${lang === 'ja' ? 'Ja' : 'En'}`]
const WIDTH: Record<string, string> = { NARROW: 'max-w-xl', STANDARD: 'max-w-2xl', WIDE: 'max-w-4xl' }
const STRIPED = new Set(['RICH_TEXT', 'LOCALIZED_RICH_TEXT', 'IMAGE', 'IMAGE_WITH_TEXT', 'GALLERY', 'QUOTE'])

function Image({ id, className }: { id: unknown; className?: string }) {
  return typeof id === 'string' ? <MediaThumb id={id} status="READY" fit="contain" className={cn('w-full rounded-none bg-transparent [&_img]:h-auto', className)} /> : null
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

/** Mirrors how amb-storage-web's CmsSections lays out a v1 section; `index` drives the alternating background. */
export function SectionPreview({ section, lang, index }: { section: CmsSection; lang: PreviewLang; index: number }) {
  const heading = str(section.settings.heading).trim()
  if (!STRIPED.has(section.type)) return <SectionBody section={section} lang={lang} />
  return (
    <section className={cn('px-5 py-8 md:py-12', index % 2 === 0 ? 'bg-white' : 'bg-[#eff5f0]')}>
      {heading ? <h2 className="mx-auto mb-6 max-w-6xl text-center text-2xl font-semibold text-gray-900 md:mb-8 md:text-3xl">{heading}</h2> : null}
      <SectionBody section={section} lang={lang} />
    </section>
  )
}

function SectionBody({ section, lang }: { section: CmsSection; lang: PreviewLang }) {
  const s = section.settings
  const blocks = section.blocks.map((block) => <Block key={block.id} block={block} lang={lang} />)
  switch (section.type) {
    case 'RICH_TEXT':
      return <div className={cn('mx-auto', WIDTH[str(s.width)] ?? WIDTH.STANDARD)}><RichTextView value={s.body} /></div>
    case 'LOCALIZED_RICH_TEXT':
      return <div className={cn('mx-auto', WIDTH.STANDARD)}><RichTextView value={pick(s, 'body', lang)} /></div>
    case 'IMAGE':
      return <div className={cn('mx-auto', WIDTH[str(s.width)] ?? WIDTH.STANDARD)}><Image id={s.mediaId} /></div>
    case 'IMAGE_WITH_TEXT':
      return (
        <div className="mx-auto grid max-w-6xl items-start gap-8 md:grid-cols-[1.2fr_1fr] md:gap-16">
          <div className={cn('overflow-hidden md:self-center', s.imagePosition === 'RIGHT' && 'md:order-2')}><Image id={s.mediaId} /></div>
          <div
            className={cn(
              'flex flex-col gap-4',
              s.imagePosition === 'RIGHT' && 'md:order-1',
              s.alignment === 'CENTER' && 'items-center text-center',
              s.alignment === 'RIGHT' && 'items-end text-right',
            )}
          >
            {blocks}
          </div>
        </div>
      )
    case 'GALLERY':
      return (
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2">
          {(Array.isArray(s.mediaIds) ? s.mediaIds : []).map((id) => <Image key={String(id)} id={id} />)}
        </div>
      )
    case 'QUOTE':
      return (
        <figure className="mx-auto max-w-2xl border-l-2 border-[#2C5F34] pl-5">
          <blockquote className="text-lg leading-relaxed text-gray-900">{str(s.text)}</blockquote>
          {s.attribution ? <figcaption className="mt-3 text-sm text-gray-500">{str(s.attribution)}</figcaption> : null}
        </figure>
      )
    case 'CONTACT':
      return (
        <section className="bg-white px-5 py-10 md:px-8 md:py-12">
          <div className="mx-auto max-w-4xl">
            <h2 className="max-w-sm text-2xl font-bold leading-[1.2] text-[#2C5F34]">{str(pick(s, 'heading', lang))}</h2>
            <RichTextView value={pick(s, 'body', lang)} className="mt-5 max-w-sm text-[13px] leading-[1.55] tracking-[0.06em] text-gray-900 [&_p]:mb-4" />
            <p className="mt-6 rounded-md border border-dashed p-4 text-center text-sm text-gray-500">Biểu mẫu liên hệ hiển thị ở đây trên website.</p>
          </div>
        </section>
      )
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
