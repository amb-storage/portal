import type { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, Link, Outlet } from '@tanstack/react-router'
import { ErrorAlert } from '@/components/common/query-state'
import { isChunkLoadError, reloadForNewBuild } from '@/lib/chunk-reload'
import { Button } from '@/components/ui/button'

export interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: Outlet,
  errorComponent: ({ error }) =>
    isChunkLoadError(error) ? (
      // A route chunk from the previous deploy is gone; the new build needs a fresh index.html.
      <div className="grid place-items-center gap-4 p-16 text-center">
        <p className="text-lg font-medium">Đã có phiên bản mới của trang quản trị</p>
        <Button onClick={() => reloadForNewBuild() || window.location.reload()}>Tải lại trang</Button>
      </div>
    ) : (
      <div className="mx-auto grid max-w-xl gap-4 p-8">
        <ErrorAlert error={error} title="Đã có lỗi xảy ra" />
      </div>
    ),
  notFoundComponent: () => (
    <div className="grid place-items-center gap-4 p-16 text-center">
      <p className="text-lg font-medium">Không tìm thấy trang</p>
      <Button asChild variant="outline">
        <Link to="/">Về bảng điều khiển</Link>
      </Button>
    </div>
  ),
})
