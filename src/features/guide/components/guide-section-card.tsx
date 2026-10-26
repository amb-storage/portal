import { Link } from '@tanstack/react-router'
import { ArrowRight, Lightbulb } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { GuideSection } from '../guide-content'
import { GuideDiagramView } from './guide-diagram'

export function GuideSectionCard({ section }: { section: GuideSection }) {
  return (
    <Card id={section.id} className="scroll-mt-44">
      <CardHeader>
        <CardTitle>{section.title}</CardTitle>
        <CardDescription>{section.summary}</CardDescription>
        {section.to ? (
          <CardAction>
            <Button asChild variant="outline" size="sm">
              <Link to={section.to}>
                {section.linkLabel} <ArrowRight />
              </Link>
            </Button>
          </CardAction>
        ) : null}
      </CardHeader>
      <CardContent className="grid gap-4 text-sm">
        {section.diagram ? <GuideDiagramView diagram={section.diagram} /> : null}
        <ol className="grid gap-2">
          {section.steps.map((step, index) => (
            <li key={step} className="flex gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                {index + 1}
              </span>
              <span className="pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
        {section.tips?.length ? (
          <ul className="grid gap-1.5 rounded-md bg-muted/50 p-3">
            {section.tips.map((tip) => (
              <li key={tip} className="flex gap-2 text-muted-foreground">
                <Lightbulb className="mt-0.5 size-4 shrink-0" /> {tip}
              </li>
            ))}
          </ul>
        ) : null}
      </CardContent>
    </Card>
  )
}
