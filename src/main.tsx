import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { authKeys } from '@/features/auth/queries'
import { onSessionExpired } from '@/lib/api/session-events'
import { installChunkReload } from '@/lib/chunk-reload'
import { queryClient } from '@/lib/query-client'
import { router } from './router'
import './index.css'

installChunkReload()

onSessionExpired(() => {
  queryClient.setQueryData(authKeys.me, null)
  if (router.state.location.pathname !== '/login') {
    void router.navigate({ to: '/login', search: { redirect: router.state.location.href } })
  }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <RouterProvider router={router} />
          <Toaster richColors position="top-right" />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
)
