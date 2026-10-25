import { PageHeader } from '@/components/common/page-header'
import { GuideSectionCard } from '../components/guide-section-card'
import { GUIDE_SECTIONS } from '../guide-content'

export function GuidePage() {
  return (
    <>
      <PageHeader title="Hướng dẫn thao tác" description="Các bước làm những việc thường gặp. Bấm vào mục lục để nhảy tới phần cần xem." />
      <div className="grid items-start gap-6 lg:grid-cols-[220px_1fr]">
        <nav aria-label="Mục lục" className="grid gap-1 text-sm lg:sticky lg:top-44">
          {GUIDE_SECTIONS.map((section) => (
            <a key={section.id} href={`#${section.id}`} className="rounded-md px-2 py-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
              {section.title}
            </a>
          ))}
        </nav>
        <div className="grid gap-6">
          {GUIDE_SECTIONS.map((section) => (
            <GuideSectionCard key={section.id} section={section} />
          ))}
        </div>
      </div>
    </>
  )
}
