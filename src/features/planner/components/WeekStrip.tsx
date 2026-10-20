import { useTranslation } from '@/i18n/useTranslation'
import { addDaysToKey, formatDayOfMonth, formatLongDate, formatWeekday, weekStartKey } from '@/lib/date'
import { cn } from '@/lib/cn'
import type { DateKey, WeekStartsOn } from '@/types/common'

interface WeekStripProps {
  selected: DateKey
  today: DateKey
  weekStartsOn: WeekStartsOn
  /** Open tasks due per day, for the dot indicators. */
  counts: Record<DateKey, number>
  onSelect: (date: DateKey) => void
}

export function WeekStrip({ selected, today, weekStartsOn, counts, onSelect }: WeekStripProps) {
  const { t } = useTranslation()
  const start = weekStartKey(selected, weekStartsOn)
  const days = Array.from({ length: 7 }, (_, index) => addDaysToKey(start, index))

  return (
    <div className="grid grid-cols-7 gap-0.5 rounded-panel border border-line bg-surface p-1" role="group" aria-label={t('my_day_week_strip')}>
      {days.map((day) => {
        const active = day === selected
        const count = counts[day] ?? 0
        return (
          <button
            key={day}
            type="button"
            onClick={() => onSelect(day)}
            aria-pressed={active}
            aria-label={count ? t('my_day_day_label', { date: formatLongDate(day), count }) : formatLongDate(day)}
            className={cn(
              'flex flex-col items-center gap-0.5 rounded-control py-1 transition-colors',
              active ? 'bg-brand text-white' : 'text-fg-2 hover:bg-surface-2',
            )}
          >
            <span className={cn('text-[10px] font-medium uppercase', !active && 'text-fg-3')}>{formatWeekday(day)}</span>
            <span className={cn('tabular text-sm font-semibold', !active && day === today && 'text-brand-ink')}>
              {formatDayOfMonth(day)}
            </span>
            <span className="flex h-1 gap-0.5" aria-hidden>
              {Array.from({ length: Math.min(count, 3) }, (_, index) => (
                <span key={index} className={cn('size-1 rounded-full', active ? 'bg-white/80' : 'bg-brand/60')} />
              ))}
            </span>
          </button>
        )
      })}
    </div>
  )
}
