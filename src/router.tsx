import { createRouter } from '@tanstack/react-router'
import { queryClient } from '@/lib/query-client'
import { routeTree } from './routeTree.gen'

export const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: 'intent',
  // Query owns caching; loaders only prime it.
  defaultPreloadStaleTime: 0,
  scrollRestoration: true,
})

export interface Crumb {
  /** Static label, or derived from the route's loader data (e.g. a product name). */
  title: string | ((loaderData: never) => string | undefined)
  parent?: { title: string; to: string }
}

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
  interface StaticDataRouteOption {
    crumb?: Crumb
  }
}
