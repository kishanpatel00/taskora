import { PROJECT_STATUS_LABEL_KEYS, type ProjectStatus } from '@/features/projects/projectTypes'
import { STATUS_LABEL_KEYS, type TaskStatus } from '@/features/tasks/taskTypes'
import { useTranslation } from '@/i18n/useTranslation'
import { cn } from '@/lib/cn'
import { STATUS_DOT_COLORS } from './badgeStyles'

/** Task status as plain text with a colored dot (no badge box). */
export function StatusBadge({ status, className }: { status: TaskStatus; className?: string }) {
  const { t } = useTranslation()
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap',
        status === 'done' ? 'text-emerald-700 dark:text-emerald-400' : 'text-fg-2',
        className,
      )}
    >
      <span className={cn('size-2 shrink-0 rounded-full', STATUS_DOT_COLORS[status])} aria-hidden />
      {t(STATUS_LABEL_KEYS[status])}
    </span>
  )
}

const PROJECT_DOT_COLORS: Record<ProjectStatus, string> = {
  planning: 'bg-violet-500',
  active: 'bg-indigo-500',
  on_hold: 'bg-amber-500',
  completed: 'bg-emerald-500',
}

/** Project status as plain text with a colored dot (no badge box). */
export function ProjectStatusBadge({ status, className }: { status: ProjectStatus; className?: string }) {
  const { t } = useTranslation()
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap text-fg-2', className)}>
      <span className={cn('size-2 shrink-0 rounded-full', PROJECT_DOT_COLORS[status])} aria-hidden />
      {t(PROJECT_STATUS_LABEL_KEYS[status])}
    </span>
  )
}
