import type { ReactNode } from 'react'
import { Provider } from 'react-redux'
import { Toaster } from 'sonner'
import { useThemeSync } from '@/features/settings/useTheme'
import { useTranslation } from '@/i18n/useTranslation'
import type { AppStore } from '@/store'
import { useAppSelector } from '@/store/hooks'

function ThemeAndToasts() {
  useThemeSync()
  const { t } = useTranslation()
  const theme = useAppSelector((state) => state.settings.theme)
  return (
    <Toaster
      theme={theme}
      position="bottom-right"
      closeButton
      duration={3500}
      containerAriaLabel={t('toast_region_label')}
      toastOptions={{ closeButtonAriaLabel: t('toast_close'), classNames: { toast: 'font-sans !rounded-menu !border-line !shadow-pop' } }}
    />
  )
}

export function AppProviders({ store, children }: { store: AppStore; children: ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeAndToasts />
      {children}
    </Provider>
  )
}
