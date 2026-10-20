import type { KeyboardEvent, ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Popover, type PopoverTriggerProps } from './Popover'

export interface DropdownItem {
  label: string
  icon?: ReactNode
  onSelect: () => void
  danger?: boolean
  disabled?: boolean
}

interface DropdownMenuProps {
  trigger: (props: PopoverTriggerProps) => ReactNode
  items: DropdownItem[]
  label: string
  align?: 'start' | 'end'
}

function focusItem(panel: HTMLElement | null, direction: 1 | -1 | 'first' | 'last') {
  if (!panel) return
  const items = Array.from(panel.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not(:disabled)'))
  if (items.length === 0) return
  const current = items.findIndex((item) => item === document.activeElement)
  let next: number
  if (direction === 'first') next = 0
  else if (direction === 'last') next = items.length - 1
  else next = (current + direction + items.length) % items.length
  items[next]?.focus()
}

/** Accessible action menu: arrow keys, Home/End, Escape, click-outside. */
export function DropdownMenu({ trigger, items, label, align = 'end' }: DropdownMenuProps) {
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const panel = event.currentTarget
    const keys: Record<string, 1 | -1 | 'first' | 'last'> = { ArrowDown: 1, ArrowUp: -1, Home: 'first', End: 'last' }
    const direction = keys[event.key]
    if (direction !== undefined) {
      event.preventDefault()
      focusItem(panel, direction)
    }
  }

  return (
    <Popover trigger={trigger} role="menu" label={label} align={align} className="min-w-40" onOpen={(panel) => focusItem(panel, 'first')}>
      {(close) => (
        <div onKeyDown={onKeyDown} className="flex flex-col">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              tabIndex={-1}
              disabled={item.disabled}
              onClick={() => {
                close(false)
                item.onSelect()
              }}
              onKeyDown={(event) => {
                if (event.key === 'Tab') close(false)
              }}
              className={cn(
                'flex h-7 w-full items-center gap-2 rounded-control px-2 text-left text-sm transition-colors outline-none disabled:opacity-50 [&_svg]:size-3.5',
                item.danger
                  ? 'text-rose-600 hover:bg-rose-50 focus:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10 dark:focus:bg-rose-500/10'
                  : 'text-fg hover:bg-surface-2 focus:bg-surface-2 [&_svg]:text-fg-3',
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </Popover>
  )
}
