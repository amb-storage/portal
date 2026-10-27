import { createFileRoute } from '@tanstack/react-router'
import { CustomerVoicePage } from '@/features/cms/home/pages/customer-voice-page'

export const Route = createFileRoute('/_app/cms/customer-voice')({
  staticData: { crumb: { title: 'Customer Voice' } },
  component: CustomerVoicePage,
})
