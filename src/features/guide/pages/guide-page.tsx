import { ArrowRight, BookOpen, Compass, Workflow } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/common/page-header'
import { GuideDiagramView, ToneLegend } from '../components/guide-diagram'
import { GuideSectionCard } from '../components/guide-section-card'
import { GLOSSARY, GUIDE_GROUPS, LIFECYCLE, PORTAL_MAP, QUICK_TASKS } from '../guide-content'

export function GuidePage() {
  return (
    <>
      <PageHeader title="Hướng dẫn sử dụng" description="Bắt đầu từ “Tôi muốn…”, hoặc đọc phần “Hiểu nhanh” để nắm cách portal và website liên quan với nhau." />
      <div className="grid items-start gap-6 lg:grid-cols-[220px_1fr]">
        <nav aria-label="Mục lục" className="grid gap-3 text-sm lg:sticky lg:top-44">
          <a href="#toi-muon" className="rounded-md px-2 py-1 font-medium hover:bg-muted">
            Tôi muốn…
          </a>
          <a href="#hieu-nhanh" className="rounded-md px-2 py-1 font-medium hover:bg-muted">
            Hiểu nhanh
          </a>
          {GUIDE_GROUPS.map((group) => (
            <div key={group.title} className="grid gap-0.5">
              <p className="px-2 text-xs font-medium text-muted-foreground uppercase">{group.title}</p>
              {group.sections.map((section) => (
                <a key={section.id} href={`#${section.id}`} className="rounded-md px-2 py-1 text-muted-foreground hover:bg-muted hover:text-foreground">
                  {section.title}
                </a>
              ))}
            </div>
          ))}
          <a href="#thuat-ngu" className="rounded-md px-2 py-1 font-medium hover:bg-muted">
            Thuật ngữ
          </a>
        </nav>

        <div className="grid min-w-0 gap-8">
          <Card id="toi-muon" className="scroll-mt-44">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Compass className="size-5" /> Tôi muốn…
              </CardTitle>
              <CardDescription>Bấm vào việc bạn cần làm để xem từng bước.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-2 sm:grid-cols-2">
                {QUICK_TASKS.map((task) => (
                  <li key={task.label}>
                    <a
                      href={`#${task.section}`}
                      className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors hover:border-primary hover:bg-muted/50"
                    >
                      {task.label}
                      <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
                    </a>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card id="hieu-nhanh" className="scroll-mt-44">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Workflow className="size-5" /> Hiểu nhanh
              </CardTitle>
              <CardDescription>Hai điều giúp bạn hiểu hầu hết các màn hình.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-2">
                <h3 className="text-sm font-semibold">1. Portal điều khiển phần nào của website</h3>
                <GuideDiagramView diagram={PORTAL_MAP} />
              </div>
              <div className="grid gap-2">
                <h3 className="text-sm font-semibold">2. Vòng đời một nội dung: Nháp → Xuất bản</h3>
                <GuideDiagramView diagram={LIFECYCLE} />
              </div>
              <ToneLegend />
            </CardContent>
          </Card>

          {GUIDE_GROUPS.map((group) => (
            <section key={group.title} className="grid gap-4">
              <h2 className="text-lg font-semibold tracking-tight">{group.title}</h2>
              {group.sections.map((section) => (
                <GuideSectionCard key={section.id} section={section} />
              ))}
            </section>
          ))}

          <Card id="thuat-ngu" className="scroll-mt-44">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="size-5" /> Thuật ngữ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-[auto_1fr]">
                {GLOSSARY.map((item) => (
                  <div key={item.term} className="contents">
                    <dt className="font-medium">{item.term}</dt>
                    <dd className="text-muted-foreground">{item.meaning}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
