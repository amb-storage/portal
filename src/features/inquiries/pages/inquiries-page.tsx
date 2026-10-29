import { FilterSelect, ListToolbar, SearchInput } from '@/components/common/list-toolbar'
import { PageHeader } from '@/components/common/page-header'
import { ErrorAlert } from '@/components/common/query-state'
import { DataTable } from '@/components/data-table/data-table'
import { DataTablePagination } from '@/components/data-table/data-table-pagination'
import { LIST_LIMIT } from '@/lib/search'
import { inquiryColumns } from '../components/inquiries-columns'
import { useInquiriesPage } from '../hooks/use-inquiries-page'
import type { InquirySearch } from '../search'
import { INQUIRY_CATEGORIES, INQUIRY_CATEGORY_LABELS, INQUIRY_STATUSES, type InquiryCategory } from '../types'

export function InquiriesPage() {
  const { search, setSearch, list, unreadCount, openInquiry } = useInquiriesPage()

  return (
    <>
      <PageHeader
        title="Liên hệ"
        description={`Tin nhắn khách gửi từ form お問い合わせ trên website.${unreadCount ? ` ${unreadCount} tin chưa đọc.` : ''}`}
      />
      <ListToolbar>
        <SearchInput value={search.q} onChange={(q) => setSearch({ q })} placeholder="Tên, email, nội dung, mã đơn…" />
        <FilterSelect
          value={search.status}
          onChange={(status) => setSearch({ status: status as InquirySearch['status'] })}
          options={INQUIRY_STATUSES}
          placeholder="Mọi trạng thái"
        />
        <FilterSelect
          value={search.category}
          onChange={(category) => setSearch({ category: category as InquirySearch['category'] })}
          options={INQUIRY_CATEGORIES}
          labelOf={(value) => INQUIRY_CATEGORY_LABELS[value as InquiryCategory]}
          placeholder="Mọi chủ đề"
        />
      </ListToolbar>
      <ErrorAlert error={list.error} />
      <DataTable
        columns={inquiryColumns}
        data={list.data?.items}
        isLoading={list.isPending}
        getRowId={(row) => row.id}
        onRowClick={(row) => openInquiry(row.id)}
        emptyMessage="Chưa có liên hệ nào."
      />
      <DataTablePagination page={search.page} limit={LIST_LIMIT} total={list.data?.total} onPageChange={(page) => setSearch({ page })} />
    </>
  )
}
