import { ArrowRight, Menu, Moon, Sun, X } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import { Link } from 'react-router-dom'
import { LanguageSelect } from '@/components/shared/LanguageSelect'
import { Logo } from '@/components/shared/Logo'
import { IconButton } from '@/components/ui/Button'
import { buttonClasses } from '@/components/ui/buttonStyles'
import { useToggleTheme } from '@/features/settings/useTheme'
import { useTranslation } from '@/i18n/useTranslation'
import { cn } from '@/lib/cn'
import { LANDING_SECTIONS } from '../data/landingContent'

export function LandingNavbar() {
  const { t } = useTranslation()
  const toggleTheme = useToggleTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuId = useId()

  // Close the mobile menu with Escape or when the viewport grows to desktop size.
  useEffect(() => {
    if (!menuOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    const media = window.matchMedia('(min-width: 768px)')
    const onChange = () => {
      if (media.matches) setMenuOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    media.addEventListener('change', onChange)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      media.removeEventListener('change', onChange)
    }
  }, [menuOpen])

  const links = LANDING_SECTIONS.map((section) => (
    <a
      key={section.id}
      href={`#${section.id}`}
      onClick={() => setMenuOpen(false)}
      className="rounded-control px-2.5 py-1.5 text-sm text-fg-2 transition-colors hover:bg-surface-2 hover:text-fg"
    >
      {t(section.labelKey)}
    </a>
  ))

  return (
    <header className="sticky top-0 z-40 animate-rise border-b border-line bg-surface/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Link to="/" className="rounded-control" aria-label={t('app_name')}>
          <Logo />
        </Link>
        <nav aria-label={t('landing_nav_label')} className="ml-4 hidden items-center gap-0.5 md:flex">
          {links}
        </nav>
        <div className="ml-auto flex items-center gap-1.5">
          <LanguageSelect size="sm" withIcon className="hidden sm:flex" />
          <IconButton label={t('landing_toggle_theme')} size="sm" onClick={toggleTheme}>
            <Sun className="hidden dark:block" />
            <Moon className="dark:hidden" />
          </IconButton>
          <Link to="/dashboard" className={buttonClasses('primary', 'sm', 'group max-sm:hidden')}>
            {t('landing_cta_open')}
            <ArrowRight className="transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
          <IconButton
            label={menuOpen ? t('landing_nav_menu_close') : t('landing_nav_menu_open')}
            size="sm"
            className="md:hidden"
            aria-expanded={menuOpen}
            aria-controls={menuId}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X /> : <Menu />}
          </IconButton>
        </div>
      </div>
      <div id={menuId} hidden={!menuOpen} className={cn('border-t border-line bg-surface px-4 py-3 md:hidden')}>
        <nav aria-label={t('landing_nav_label')} className="flex flex-col">
          {links}
        </nav>
        <div className="mt-3 flex items-center gap-2 border-t border-line pt-3">
          <LanguageSelect size="sm" withIcon className="flex-1" />
          <Link to="/dashboard" className={buttonClasses('primary', 'sm')}>
            {t('landing_cta_open')}
          </Link>
        </div>
      </div>
    </header>
  )
}
