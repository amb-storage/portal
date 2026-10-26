import { ArrowUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { scrollToId, TOC_ID } from '../scroll'

interface SectionTocProps {
  items: Array<{ id: string; label: string }>
}

/** Numbered table of contents for long editors; mirrors the menu the website shows. */
export function SectionToc({ items }: SectionTocProps) {
  return (
    <Card id={TOC_ID} className="scroll-mt-40">
      <CardHeader>
        <CardTitle>Mục lục</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="grid gap-1 text-sm sm:grid-cols-2">
          {items.map((item, index) => (
            <li key={item.id} className="flex items-baseline gap-1">
              <span className="w-6 shrink-0 text-muted-foreground tabular-nums">{index + 1}.</span>
              <button type="button" className="text-left underline-offset-4 hover:text-primary hover:underline" onClick={() => scrollToId(item.id)}>
                {item.label || '(chưa đặt tiêu đề)'}
              </button>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  )
}

/** Small "back to the table of contents" button for section headers. */
export function BackToToc() {
  return (
    <Button type="button" size="sm" variant="ghost" className="text-muted-foreground" onClick={() => scrollToId(TOC_ID)}>
      <ArrowUp /> Mục lục
    </Button>
  )
}
