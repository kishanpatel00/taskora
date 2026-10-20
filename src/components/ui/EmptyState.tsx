import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
  compact?: boolean
}

export function EmptyState({ icon, title, description, action, className, compact = false }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        compact ? 'gap-1.5 px-4 py-6' : 'gap-2.5 px-6 py-10',
        className,
      )}
    >
      <div
        className={cn(
          'flex items-center justify-center rounded-menu border border-line bg-surface-2 text-fg-3',
          compact ? 'size-8 [&_svg]:size-4' : 'size-10 [&_svg]:size-5',
        )}
      >
        {icon}
      </div>
      <div className="max-w-sm">
        <p className={cn('font-semibold text-fg', compact ? 'text-sm' : 'text-base')}>{title}</p>
        {description && <p className="mt-0.5 text-sm text-fg-3">{description}</p>}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  )
}
