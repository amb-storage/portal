import { createFileRoute } from '@tanstack/react-router'
import { LoadingBlock } from '@/components/common/query-state'
import { inquiryDetailQuery } from '@/features/inquiries/queries'
import { InquiryDetailPage } from '@/features/inquiries/pages/inquiry-detail-page'
import type { Inquiry } from '@/features/inquiries/types'

export const Route = createFileRoute('/_app/inquiries/$inquiryId')({
  staticData: { crumb: { title: (inquiry: Inquiry) => inquiry.subject, parent: { title: 'Liên hệ', to: '/inquiries' } } },
  loader: ({ context, params }) => context.queryClient.ensureQueryData(inquiryDetailQuery(params.inquiryId)),
  pendingComponent: LoadingBlock,
  component: InquiryDetailPage,
})
