import type { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, Link, Outlet } from '@tanstack/react-router'
import { RouteError } from '@/components/common/route-states'
import { Button } from '@/components/ui/button'

export interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: Outlet,
  errorComponent: RouteError,
  notFoundComponent: () => (
    <div className="grid place-items-center gap-4 p-16 text-center">
      <p className="text-lg font-medium">Không tìm thấy trang</p>
      <Button asChild variant="outline">
        <Link to="/">Về bảng điều khiển</Link>
      </Button>
    </div>
  ),
})
