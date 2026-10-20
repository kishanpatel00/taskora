import { X } from 'lucide-react'
import { useEffect, useEffectEvent, useRef } from 'react'
import { createPortal } from 'react-dom'
import { IconButton } from '@/components/ui/Button'
import { useTranslation } from '@/i18n/useTranslation'
import { trapTabKey } from '@/lib/focus'
import { SidebarContent } from './SidebarContent'

interface MobileNavigationProps {
  open: boolean
  onClose: () => void
}

/** Slide-out navigation drawer for small screens. */
export function MobileNavigation({ open, onClose }: MobileNavigationProps) {
  if (!open) return null
  return createPortal(<Drawer onClose={onClose} />, document.body)
}

function Drawer({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation()
  const panelRef = useRef<HTMLDivElement>(null)
  const requestClose = useEffectEvent(() => onClose())

  useEffect(() => {
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null
    panelRef.current?.focus()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') requestClose()
      if (event.key === 'Tab') trapTabKey(event, panelRef.current)
    }
    const onResize = () => {
      if (window.matchMedia('(min-width: 1024px)').matches) requestClose()
    }
    document.addEventListener('keydown', onKeyDown)
    window.addEventListener('resize', onResize)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('resize', onResize)
      document.body.style.overflow = previousOverflow
      previouslyFocused?.focus()
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 animate-fade-in bg-overlay" onClick={onClose} aria-hidden />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={t('navigation_drawer')}
        tabIndex={-1}
        className="relative h-full w-64 max-w-[85vw] animate-slide-in-left border-r border-line bg-surface shadow-modal outline-none"
      >
        <IconButton label={t('navigation_close_menu')} size="sm" onClick={onClose} className="absolute top-2.5 right-2 z-10">
          <X />
        </IconButton>
        <SidebarContent onNavigate={onClose} />
      </div>
    </div>
  )
}
