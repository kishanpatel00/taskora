import { Flag } from 'lucide-react'
import { PRIORITY_LABEL_KEYS, type TaskPriority } from '@/features/tasks/taskTypes'
import { useTranslation } from '@/i18n/useTranslation'
import { cn } from '@/lib/cn'
import { PRIORITY_FLAG_COLORS } from './badgeStyles'

/** Priority as a colored flag icon plus plain text (no badge box). */
export function PriorityBadge({ priority, className }: { priority: TaskPriority; className?: string }) {
  const { t } = useTranslation()
  const label = t(PRIORITY_LABEL_KEYS[priority])
  return (
    <span className={cn('inline-flex items-center gap-1 text-xs font-medium whitespace-nowrap text-fg-2', className)}>
      <Flag className={cn('size-3 shrink-0', PRIORITY_FLAG_COLORS[priority], priority !== 'low' && 'fill-current')} aria-hidden />
      <span aria-hidden>{label}</span>
      <span className="sr-only">{t('task_priority_suffix', { priority: label })}</span>
    </span>
  )
}
