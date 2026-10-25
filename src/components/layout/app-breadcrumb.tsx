import { Fragment } from 'react'
import { Link, useMatches } from '@tanstack/react-router'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

interface Trail {
  title: string
  to?: string
}

/** Builds the trail from the deepest matched route's `staticData.crumb`. */
function useTrail(): Trail[] {
  const matches = useMatches()
  const match = [...matches].reverse().find((candidate) => candidate.staticData.crumb)
  const crumb = match?.staticData.crumb
  if (!match || !crumb) return []
  const resolve = crumb.title as string | ((data: unknown) => string | undefined)
  const title = typeof resolve === 'function' ? (match.loaderData ? resolve(match.loaderData) : undefined) : resolve
  const trail: Trail[] = []
  if (match.pathname !== '/') trail.push({ title: 'Bảng điều khiển', to: '/' })
  if (crumb.parent) trail.push(crumb.parent)
  trail.push({ title: title ?? '…' })
  return trail
}

export function AppBreadcrumb() {
  const trail = useTrail()
  return (
    <Breadcrumb className="min-w-0">
      <BreadcrumbList className="flex-nowrap">
        {trail.map((item, index) => (
          <Fragment key={`${index}-${item.title}`}>
            {index > 0 ? <BreadcrumbSeparator className="hidden sm:block" /> : null}
            <BreadcrumbItem className={index < trail.length - 1 ? 'hidden sm:inline-flex' : 'min-w-0'}>
              {item.to ? (
                <BreadcrumbLink asChild>
                  <Link to={item.to}>{item.title}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage className="truncate">{item.title}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
