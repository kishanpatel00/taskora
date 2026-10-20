import { CalendarDays } from 'lucide-react'
import { formatDateLabel, formatShortDate } from '@/lib/date'
import { cn } from '@/lib/cn'
import { useTranslation } from '@/i18n/useTranslation'
import type { DateKey } from '@/types/common'

interface DueDateProps {
  date: DateKey
  today: DateKey
  done?: boolean
  className?: string
}

/** Due date with urgency coloring: overdue (red), today (amber), otherwise muted. */
export function DueDate({ date, today, done = false, className }: DueDateProps) {
  const { t } = useTranslation()
  const overdue = !done && date < today
  const dueToday = !done && date === today
  return (
    <time
      dateTime={date}
      title={t('date_due_on', { date: formatShortDate(date) })}
      className={cn(
        'inline-flex items-center gap-1 text-xs whitespace-nowrap [&_svg]:size-3',
        overdue
          ? 'font-medium text-rose-600 dark:text-rose-400'
          : dueToday
            ? 'font-medium text-amber-600 dark:text-amber-400'
            : 'text-fg-3',
        className,
      )}
    >
      <CalendarDays aria-hidden />
      {overdue && <span className="sr-only">{t('common_overdue_prefix')} </span>}
      {formatDateLabel(date, today)}
    </time>
  )
}
