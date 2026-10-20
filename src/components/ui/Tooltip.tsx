import type { ReactElement, ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface TooltipProps {
  content: ReactNode
  children: ReactElement
  side?: 'top' | 'right' | 'bottom'
  /** When false the tooltip is not rendered (e.g. label already visible). */
  enabled?: boolean
}

const sides = {
  top: 'bottom-full left-1/2 mb-2 -translate-x-1/2',
  right: 'left-full top-1/2 ml-2.5 -translate-y-1/2',
  bottom: 'top-full left-1/2 mt-2 -translate-x-1/2',
} as const

/**
 * Lightweight CSS tooltip shown on hover and keyboard focus. Purely visual:
 * the wrapped control must already have an accessible name.
 */
export function Tooltip({ content, children, side = 'top', enabled = true }: TooltipProps) {
  if (!enabled) return children
  return (
    <span className="group/tooltip relative inline-flex">
      {children}
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute z-50 rounded-control bg-gray-900 px-1.5 py-1 text-[11px] leading-none font-medium whitespace-nowrap text-white opacity-0 shadow-pop transition-opacity delay-200 duration-100 group-focus-within/tooltip:opacity-100 group-hover/tooltip:opacity-100 dark:bg-gray-700',
          sides[side],
        )}
      >
        {content}
      </span>
    </span>
  )
}
