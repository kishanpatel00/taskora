import { ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'

const tones = {
  brand: 'text-brand-ink',
  success: 'text-emerald-600 dark:text-emerald-400',
  danger: 'text-rose-600 dark:text-rose-400',
  accent: 'text-accent',
} as const

interface StatCardProps {
  label: string
  value: number | string
  icon: ReactNode
  hint: ReactNode
  to: string
  tone: keyof typeof tones
}

/** Compact metric tile that links to the relevant page or filter. */
export function StatCard({ label, value, icon, hint, to, tone }: StatCardProps) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-panel border border-line bg-surface px-3.5 py-3 transition-colors hover:border-line-strong hover:bg-surface-2"
    >
      <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-control bg-surface-2 [&_svg]:size-4', tones[tone])}>{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-fg-2">{label}</p>
        <p className="flex items-baseline gap-2">
          <span className="tabular text-xl leading-7 font-semibold text-fg">{value}</span>
          <span className="truncate text-xs text-fg-3">{hint}</span>
        </p>
      </div>
      <ChevronRight className="size-4 shrink-0 text-fg-3 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
    </Link>
  )
}
