import type { ReactNode } from 'react'
import { Store } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

/** Decorative only: hidden from assistive tech and pointer events. */
function AnimatedBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="auth-glow -top-24 -left-24 size-[28rem] bg-primary" />
      <div className="auth-glow top-1/3 -right-32 size-[26rem] bg-sidebar-primary [animation-delay:-6s] [animation-duration:22s]" />
      <div className="auth-glow -bottom-32 left-1/4 size-[24rem] bg-accent [animation-delay:-12s] [animation-duration:26s]" />
      <div className="absolute inset-0 bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_75%)]" />
    </div>
  )
}

export function AuthCard({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <div className="relative isolate flex min-h-svh items-center justify-center overflow-hidden bg-background p-4">
      <AnimatedBackdrop />
      <Card className="relative w-full max-w-sm border-border/60 bg-card/85 shadow-xl backdrop-blur-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md">
            <Store className="size-5" />
          </div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  )
}
