import { createFileRoute, redirect } from '@tanstack/react-router'

/** Customer Voice now lives in the Home editor; keep old links working. */
export const Route = createFileRoute('/_app/cms/customer-voice')({
  beforeLoad: () => {
    throw redirect({ to: '/cms/home', hash: 'customer-voice', replace: true })
  },
})
