import { useEffect, useEffectEvent, useId, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/cn'

export interface PopoverTriggerProps {
  ref: (element: HTMLButtonElement | null) => void
  onClick: () => void
  'aria-expanded': boolean
  'aria-haspopup': 'menu' | 'dialog'
  'aria-controls': string | undefined
}

interface PopoverProps {
  trigger: (props: PopoverTriggerProps) => ReactNode
  children: (close: (restoreFocus?: boolean) => void) => ReactNode
  align?: 'start' | 'end'
  className?: string
  role?: 'menu' | 'dialog'
  label: string
  /** Called when the popover opens, e.g. to focus the first menu item. */
  onOpen?: (panel: HTMLDivElement) => void
}

interface Position {
  top?: number
  bottom?: number
  left?: number
  right?: number
}

const GAP = 4
const FLIP_THRESHOLD = 280

/**
 * Floating panel anchored to a trigger. Rendered in a portal with fixed
 * positioning so scroll containers (Kanban columns, tables) never clip it.
 */
export function Popover({ trigger, children, align = 'end', className, role = 'dialog', label, onOpen }: PopoverProps) {
  const [position, setPosition] = useState<Position | null>(null)
  const [triggerElement, setTriggerElement] = useState<HTMLButtonElement | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const id = useId()
  const open = position !== null
  const handleOpen = useEffectEvent((panel: HTMLDivElement) => onOpen?.(panel))

  const close = (restoreFocus = true) => {
    setPosition(null)
    if (restoreFocus) triggerElement?.focus()
  }

  const toggle = () => {
    if (open) return close()
    const rect = triggerElement?.getBoundingClientRect()
    if (!rect) return
    const below = window.innerHeight - rect.bottom
    const next: Position =
      below < FLIP_THRESHOLD && rect.top > below
        ? { bottom: window.innerHeight - rect.top + GAP }
        : { top: rect.bottom + GAP }
    if (align === 'end') next.right = Math.max(8, window.innerWidth - rect.right)
    else next.left = Math.max(8, rect.left)
    setPosition(next)
  }

  useEffect(() => {
    if (!open) return
    if (panelRef.current) handleOpen(panelRef.current)

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target
      if (!(target instanceof Node)) return
      if (panelRef.current?.contains(target) || triggerElement?.contains(target)) return
      setPosition(null)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        setPosition(null)
        triggerElement?.focus()
      }
    }
    const onViewportChange = (event: Event) => {
      if (event.target instanceof Node && panelRef.current?.contains(event.target)) return
      setPosition(null)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown, true)
    window.addEventListener('resize', onViewportChange)
    window.addEventListener('scroll', onViewportChange, true)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown, true)
      window.removeEventListener('resize', onViewportChange)
      window.removeEventListener('scroll', onViewportChange, true)
    }
  }, [open, triggerElement])

  return (
    <>
      {trigger({
        ref: setTriggerElement,
        onClick: toggle,
        'aria-expanded': open,
        'aria-haspopup': role,
        'aria-controls': open ? id : undefined,
      })}
      {position &&
        createPortal(
          <div
            ref={panelRef}
            id={id}
            role={role}
            aria-label={label}
            style={position}
            className={cn(
              'fixed z-[60] max-h-[min(70vh,28rem)] animate-scale-in overflow-y-auto rounded-menu border border-line bg-surface p-1 shadow-pop scrollbar-thin',
              className,
            )}
          >
            {children(close)}
          </div>,
          document.body,
        )}
    </>
  )
}
