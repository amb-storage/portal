import { Link, type LinkProps } from '@tanstack/react-router'
import type { LucideIcon } from 'lucide-react'
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface StatCardProps {
  label: string
  to: NonNullable<LinkProps['to']>
  icon: LucideIcon
  value: number | undefined
  isLoading: boolean
  error: unknown
}

export function StatCard({ label, to, icon: Icon, value, isLoading, error }: StatCardProps) {
  return (
    <Link to={to} className="block rounded-xl transition hover:-translate-y-0.5 hover:shadow-md">
      <Card>
        <CardHeader>
          <CardDescription>{label}</CardDescription>
          <CardTitle className="text-3xl tabular-nums">
            {isLoading ? <Skeleton className="h-9 w-16" /> : error ? '—' : value}
          </CardTitle>
          <CardAction>
            <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Icon className="size-4" />
            </span>
          </CardAction>
        </CardHeader>
      </Card>
    </Link>
  )
}
