import { X } from 'lucide-react'
import { useEffect, useEffectEvent, useId, useRef, type ComponentProps, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/cn'
import { getFocusableElements, trapTabKey } from '@/lib/focus'
import { useTranslation } from '@/i18n/useTranslation'
import { IconButton } from './Button'

/** Open modals, top-most last — only the top one reacts to Escape/Tab. */
const modalStack: string[] = []

const sizes = {
  sm: 'sm:max-w-[420px]',
  md: 'sm:max-w-[520px]',
  lg: 'sm:max-w-[640px]',
  xl: 'sm:max-w-[880px]',
} as const

interface ModalProps {
  open: boolean
  onClose: () => void
  title: ReactNode
  description?: ReactNode
  size?: keyof typeof sizes
  children: ReactNode
  /** Extra header content (e.g. badges) shown next to the title. */
  headerExtra?: ReactNode
}

export function Modal({ open, ...props }: ModalProps) {
  if (!open) return null
  return createPortal(<ModalPanel {...props} />, document.body)
}

function ModalPanel({ onClose, title, description, size = 'md', children, headerExtra }: Omit<ModalProps, 'open'>) {
  const id = useId()
  const { t } = useTranslation()
  const panelRef = useRef<HTMLDivElement>(null)
  const requestClose = useEffectEvent(() => onClose())

  useEffect(() => {
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const panel = panelRef.current
    modalStack.push(id)

    if (panel && !panel.contains(document.activeElement)) {
      const preferred = panel.querySelector<HTMLElement>('[data-autofocus]')
      ;(preferred ?? getFocusableElements(panel).find((el) => el.dataset.modalClose === undefined) ?? panel).focus()
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event: KeyboardEvent) => {
      if (modalStack[modalStack.length - 1] !== id) return
      if (event.key === 'Escape') {
        event.preventDefault()
        requestClose()
      } else if (event.key === 'Tab') {
        trapTabKey(event, panelRef.current)
      }
    }
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      modalStack.splice(modalStack.indexOf(id), 1)
      document.body.style.overflow = previousOverflow
      if (previouslyFocused?.isConnected) previouslyFocused.focus()
    }
  }, [id])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 animate-fade-in bg-overlay backdrop-blur-[2px]" onMouseDown={() => onClose()} aria-hidden />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        aria-describedby={description ? `${id}-description` : undefined}
        tabIndex={-1}
        className={cn(
          'relative flex max-h-[92dvh] w-full animate-scale-in flex-col overflow-hidden rounded-t-panel border border-line bg-surface shadow-modal outline-none sm:rounded-panel',
          sizes[size],
        )}
      >
        <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 id={`${id}-title`} className="text-lg font-semibold text-fg">
                {title}
              </h2>
              {headerExtra}
            </div>
            {description && (
              <p id={`${id}-description`} className="mt-0.5 text-sm text-fg-2">
                {description}
              </p>
            )}
          </div>
          <IconButton label={t('common_close_dialog')} size="sm" onClick={onClose} data-modal-close className="-my-1 -mr-1.5">
            <X />
          </IconButton>
        </div>
        {children}
      </div>
    </div>
  )
}

interface ModalBodyProps extends ComponentProps<'div'> {
  /** Remove the default padding, for layouts with their own panes (e.g. a sidebar). */
  flush?: boolean
}

export function ModalBody({ className, flush = false, ...props }: ModalBodyProps) {
  return <div className={cn('min-h-0 flex-1 overflow-y-auto scrollbar-thin', !flush && 'px-4 py-4', className)} {...props} />
}

export function ModalFooter({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'flex flex-col-reverse gap-2 border-t border-line bg-surface-2 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-end',
        className,
      )}
      {...props}
    />
  )
}
