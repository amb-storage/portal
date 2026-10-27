import { Button } from '@/components/ui/button'
import { isChunkLoadError, reloadForNewBuild } from '@/lib/chunk-reload'
import { ErrorAlert, LoadingBlock } from './query-state'

/** Shown while a page's code or data loads, instead of an empty content area. */
export function RoutePending() {
  return <LoadingBlock />
}

/** Route errors render inside the layout, so the sidebar stays usable. */
export function RouteError({ error, reset }: { error: unknown; reset?: () => void }) {
  if (isChunkLoadError(error))
    // A route chunk from the previous deploy is gone; the new build needs a fresh index.html.
    return (
      <div className="grid place-items-center gap-4 p-16 text-center">
        <p className="text-lg font-medium">Đã có phiên bản mới của trang quản trị</p>
        <Button onClick={() => reloadForNewBuild() || window.location.reload()}>Tải lại trang</Button>
      </div>
    )
  return (
    <div className="mx-auto grid w-full max-w-xl gap-4 p-8">
      <ErrorAlert error={error} title="Đã có lỗi xảy ra" />
      {reset ? (
        <Button variant="outline" className="justify-self-start" onClick={reset}>
          Thử lại
        </Button>
      ) : null}
    </div>
  )
}
