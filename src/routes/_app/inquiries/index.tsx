import { createFileRoute } from '@tanstack/react-router'
import { InquiriesPage } from '@/features/inquiries/pages/inquiries-page'
import { inquirySearchSchema } from '@/features/inquiries/search'

export const Route = createFileRoute('/_app/inquiries/')({
  staticData: { crumb: { title: 'Liên hệ' } },
  validateSearch: inquirySearchSchema,
  component: InquiriesPage,
})
