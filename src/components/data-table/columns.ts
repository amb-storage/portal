import { createColumnHelper, tableFeatures, type ColumnDef, type RowData } from '@tanstack/react-table'

/**
 * Shared feature set. Pagination/filtering are server-side (route search params),
 * so the table only needs the core row model.
 */
export const tableFeatureSet = tableFeatures({})

export type TableFeatureSet = typeof tableFeatureSet

export type AppColumnDef<TData extends RowData> = ColumnDef<TableFeatureSet, TData, any>

export function columnHelper<TData extends RowData>() {
  return createColumnHelper<TableFeatureSet, TData>()
}
