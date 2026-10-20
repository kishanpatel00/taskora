import { Suspense, useState } from 'react'
import { Outlet, ScrollRestoration } from 'react-router-dom'
import { DialogsProvider } from '@/app/dialogs/DialogsProvider'
import { useDialogs } from '@/app/dialogs/useDialogs'
import { PageSkeleton } from '@/components/shared/LoadingState'
import { CommandPalette } from '@/features/command-palette/CommandPalette'
import { FocusTimerWatcher } from '@/features/focus/FocusTimerWatcher'
import { useGlobalShortcuts } from '@/hooks/useGlobalShortcuts'
import { useTranslation } from '@/i18n/useTranslation'
import { Header } from './Header'
import { MobileNavigation } from './MobileNavigation'
import { PageContainer } from './PageContainer'
import { Sidebar } from './Sidebar'

export function AppLayout() {
  return (
    <DialogsProvider>
      <Shell />
    </DialogsProvider>
  )
}

function Shell() {
  const { t } = useTranslation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const { openCreateTask } = useDialogs()

  useGlobalShortcuts({
    onCommandPalette: () => setPaletteOpen((open) => !open),
    onNewTask: () => openCreateTask(),
  })

  return (
    <div className="flex min-h-dvh">
      <a
        href="#main"
        className="sr-only z-[80] rounded-control bg-brand px-4 py-2 text-sm font-medium text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        {t('navigation_skip_to_content')}
      </a>
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header onOpenMenu={() => setMenuOpen(true)} onOpenCommandPalette={() => setPaletteOpen(true)} />
        <main id="main" tabIndex={-1} className="min-w-0 flex-1 outline-none">
          <Suspense
            fallback={
              <PageContainer>
                <PageSkeleton />
              </PageContainer>
            }
          >
            <Outlet />
          </Suspense>
        </main>
      </div>
      <MobileNavigation open={menuOpen} onClose={() => setMenuOpen(false)} />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <FocusTimerWatcher />
      <ScrollRestoration />
    </div>
  )
}
