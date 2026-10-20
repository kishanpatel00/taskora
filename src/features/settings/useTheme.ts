import { useCallback, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import type { ThemePreference } from '@/types/common'
import { settingsUpdated } from './settingsSlice'

const DARK_QUERY = '(prefers-color-scheme: dark)'

export function resolveTheme(preference: ThemePreference, systemPrefersDark: boolean): 'light' | 'dark' {
  if (preference === 'system') return systemPrefersDark ? 'dark' : 'light'
  return preference
}

/** Keeps the `dark` class on <html> in sync with the theme setting (and the OS when set to system). */
export function useThemeSync(): void {
  const preference = useAppSelector((state) => state.settings.theme)

  useEffect(() => {
    const media = window.matchMedia(DARK_QUERY)
    const apply = () => {
      const dark = resolveTheme(preference, media.matches) === 'dark'
      document.documentElement.classList.toggle('dark', dark)
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0b0e17' : '#4f46e5')
    }
    apply()
    if (preference !== 'system') return
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [preference])
}

/** Flips between light and dark based on what is currently displayed. */
export function useToggleTheme(): () => void {
  const dispatch = useAppDispatch()
  return useCallback(() => {
    const isDark = document.documentElement.classList.contains('dark')
    dispatch(settingsUpdated({ theme: isDark ? 'light' : 'dark' }))
  }, [dispatch])
}
