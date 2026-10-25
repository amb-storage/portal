import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DataTablePaginationProps {
  page: number
  limit: number
  total: number | undefined
  onPageChange: (page: number) => void
}

/** Server-side pagination driven by the API's { page, limit, total } envelope. */
export function DataTablePagination({ page, limit, total, onPageChange }: DataTablePaginationProps) {
  const pageCount = total === undefined ? page : Math.max(1, Math.ceil(total / limit))
  const from = total === 0 ? 0 : (page - 1) * limit + 1
  const to = total === undefined ? page * limit : Math.min(page * limit, total)

  return (
    <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
      <span>{total === undefined ? `Trang ${page}` : `${from}–${to} / ${total}`}</span>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft /> Trước
        </Button>
        <span>
          {page} / {pageCount}
        </span>
        <Button variant="outline" size="sm" disabled={page >= pageCount} onClick={() => onPageChange(page + 1)}>
          Sau <ChevronRight />
        </Button>
      </div>
    </div>
  )
}
