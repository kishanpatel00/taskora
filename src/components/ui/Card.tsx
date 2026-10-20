import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/cn'

export function Card({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('rounded-panel border border-line bg-surface', className)} {...props} />
}

interface CardHeaderProps {
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  icon?: ReactNode
  className?: string
  /** Heading level for document outline. */
  as?: 'h2' | 'h3'
}

export function CardHeader({ title, description, action, icon, className, as: Heading = 'h2' }: CardHeaderProps) {
  return (
    <div className={cn('flex min-h-11 items-center justify-between gap-3 px-3.5 py-2', className)}>
      <div className="flex min-w-0 items-center gap-2">
        {icon && (
          <span className="flex shrink-0 items-center text-fg-3 [&_svg]:size-4">
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <Heading className="truncate text-sm font-semibold text-fg">{title}</Heading>
          {description && <p className="truncate text-xs text-fg-3">{description}</p>}
        </div>
      </div>
      {action && <div className="flex shrink-0 items-center gap-1">{action}</div>}
    </div>
  )
}

export function CardBody({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('px-3.5 pb-3.5', className)} {...props} />
}
