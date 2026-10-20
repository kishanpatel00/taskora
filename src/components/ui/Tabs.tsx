import { useRef, type KeyboardEvent, type ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { tabId, tabPanelId } from './tabIds'

export interface TabItem<T extends string> {
  value: T
  label: string
  icon?: ReactNode
}

interface TabsProps<T extends string> {
  items: ReadonlyArray<TabItem<T>>
  value: T
  onChange: (value: T) => void
  label: string
  /** When set, tabs reference panels rendered with `tabPanelId(idPrefix, value)`. */
  idPrefix?: string
  size?: 'sm' | 'md'
  className?: string
  /** Hide labels below the `sm` breakpoint (icons stay visible). */
  compactOnMobile?: boolean
}

/** Segmented tab list with roving focus (Arrow keys, Home, End). */
export function Tabs<T extends string>({
  items,
  value,
  onChange,
  label,
  idPrefix,
  size = 'md',
  className,
  compactOnMobile = false,
}: TabsProps<T>) {
  const listRef = useRef<HTMLDivElement>(null)

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = items.findIndex((item) => item.value === value)
    const map: Record<string, number> = {
      ArrowRight: (index + 1) % items.length,
      ArrowLeft: (index - 1 + items.length) % items.length,
      Home: 0,
      End: items.length - 1,
    }
    const next = map[event.key]
    const item = next === undefined ? undefined : items[next]
    if (!item) return
    event.preventDefault()
    onChange(item.value)
    listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next ?? 0]?.focus()
  }

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={cn('inline-flex items-center gap-0.5 rounded-menu border border-line bg-surface-3/60 p-0.5', className)}
    >
      {items.map((item) => {
        const selected = item.value === value
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            id={idPrefix ? tabId(idPrefix, item.value) : undefined}
            aria-controls={idPrefix ? tabPanelId(idPrefix, item.value) : undefined}
            aria-selected={selected}
            aria-label={compactOnMobile ? item.label : undefined}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(item.value)}
            className={cn(
              'inline-flex items-center justify-center gap-1.5 rounded-control font-medium transition-colors [&_svg]:size-3.5',
              size === 'sm' ? 'h-[22px] px-2 text-xs' : 'h-[26px] px-2.5 text-sm',
              selected ? 'bg-surface text-fg shadow-xs ring-1 ring-line' : 'text-fg-2 hover:text-fg',
            )}
          >
            {item.icon}
            <span className={cn(compactOnMobile && 'hidden sm:inline')}>{item.label}</span>
          </button>
        )
      })}
    </div>
  )
}
