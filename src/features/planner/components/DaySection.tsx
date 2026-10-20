import { ChevronDown } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface DaySectionProps {
  id: string
  title: string
  count: number
  tone?: 'default' | 'danger' | 'success'
  description?: string
  children: ReactNode
  defaultOpen?: boolean
}

const toneClasses = {
  default: 'bg-surface-3 text-fg-2',
  danger: 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300',
  success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
} as const

/** Collapsible task group used by My Day. */
export function DaySection({ id, title, count, tone = 'default', description, children, defaultOpen = true }: DaySectionProps) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <section aria-labelledby={`${id}-heading`} className="rounded-panel border border-line bg-surface">
      <h2 id={`${id}-heading`}>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls={`${id}-content`}
          className="flex h-9 w-full items-center gap-2 px-3 text-left hover:bg-surface-2"
        >
          <ChevronDown className={cn('size-3.5 text-fg-3 transition-transform', !open && '-rotate-90')} aria-hidden />
          <span className="text-sm font-semibold text-fg">{title}</span>
          <span className={cn('tabular rounded-control px-1.5 text-[11px] leading-4 font-semibold', toneClasses[tone])}>{count}</span>
          {description && <span className="ml-auto hidden text-xs font-normal text-fg-3 sm:inline">{description}</span>}
        </button>
      </h2>
      <div id={`${id}-content`} hidden={!open} className="border-t border-line [&_ul]:divide-y [&_ul]:divide-line">
        {children}
      </div>
    </section>
  )
}
