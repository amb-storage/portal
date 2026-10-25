import type { RowData } from '@tanstack/react-table'
import { useTable } from '@tanstack/react-table'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { tableFeatureSet, type AppColumnDef } from './columns'

const EMPTY: never[] = []

/** Clicks on links, buttons and inputs inside a row keep their own behavior. */
const INTERACTIVE = 'a, button, input, textarea, select, label, [role="checkbox"], [role="dialog"]'

interface DataTableProps<TData extends RowData> {
  /** Must be stable (module scope or useMemo). */
  columns: AppColumnDef<TData>[]
  data: TData[] | undefined
  isLoading?: boolean
  emptyMessage?: string
  getRowId?: (row: TData) => string
  onRowClick?: (row: TData) => void
}

export function DataTable<TData extends RowData>({
  columns,
  data,
  isLoading,
  emptyMessage = 'Không có dữ liệu.',
  getRowId,
  onRowClick,
}: DataTableProps<TData>) {
  const table = useTable({
    features: tableFeatureSet,
    columns,
    data: data ?? (EMPTY as TData[]),
    getRowId: getRowId ? (row) => getRowId(row) : undefined,
  })
  const rows = table.getRowModel().rows

  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id}>
              {group.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading && rows.length === 0 ? (
            Array.from({ length: 5 }, (_, index) => (
              <TableRow key={index}>
                <TableCell colSpan={columns.length}>
                  <Skeleton className="h-5 w-full" />
                </TableCell>
              </TableRow>
            ))
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow
                key={row.id}
                className={cn(onRowClick && 'cursor-pointer hover:bg-muted/50')}
                onClick={
                  onRowClick
                    ? (event) => {
                        if (!(event.target as HTMLElement).closest(INTERACTIVE)) onRowClick(row.original)
                      }
                    : undefined
                }
              >
                {row.getAllCells().map((cell) => (
                  <TableCell key={cell.id}>
                    <table.FlexRender cell={cell} />
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
