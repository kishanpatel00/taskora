import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { toast } from 'sonner'
import i18n from '@/i18n'
import type { AppStore } from '@/store'
import type { BootstrapResult } from './bootstrap'
import { AppProviders } from './providers'
import { router } from './router'

interface AppProps {
  store: AppStore
  notice: BootstrapResult['notice']
}

export function App({ store, notice }: AppProps) {
  useEffect(() => {
    if (!notice) return
    const show = notice.kind === 'warning' ? toast.warning : toast.info
    show(i18n.t(notice.messageKey), { id: 'startup-notice', duration: 8000 })
  }, [notice])

  return (
    <AppProviders store={store}>
      <RouterProvider router={router} />
    </AppProviders>
  )
}
