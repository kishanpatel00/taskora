import { addMonths, isSameMonth, startOfMonth } from 'date-fns'
import { CalendarPlus, ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { useDialogs } from '@/app/dialogs/useDialogs'
import { Button, IconButton } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { TaskRow } from '@/features/tasks/components/TaskRow'
import type { Task } from '@/features/tasks/taskTypes'
import { isTaskDone } from '@/features/tasks/taskUtils'
import { useTranslation } from '@/i18n/useTranslation'
import { addDaysToKey, formatDayOfMonth, formatLongDate, formatMonthYear, getMonthGrid, getWeekdayLabels, parseDateKey, toDateKey } from '@/lib/date'
import { cn } from '@/lib/cn'
import type { DateKey, WeekStartsOn } from '@/types/common'

interface CalendarViewProps {
  tasks: Task[]
  today: DateKey
  weekStartsOn: WeekStartsOn
  /** Project for tasks created from the calendar. */
  projectId: string | null
}

const MAX_CHIPS = 3
const KEY_STEPS: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }

/** Month calendar showing tasks on their due dates. Arrow keys move between days. */
export function CalendarView({ tasks, today, weekStartsOn, projectId }: CalendarViewProps) {
  const { t } = useTranslation()
  const { openTask, openCreateTask } = useDialogs()
  const [month, setMonth] = useState(() => startOfMonth(parseDateKey(today)))
  const [selected, setSelected] = useState<DateKey>(today)
  const gridRef = useRef<HTMLDivElement>(null)

  const weeks = useMemo(() => getMonthGrid(month, weekStartsOn), [month, weekStartsOn])
  const tasksByDate = useMemo(() => {
    const map = new Map<DateKey, Task[]>()
    for (const task of tasks) {
      if (!task.dueDate) continue
      const list = map.get(task.dueDate) ?? []
      list.push(task)
      map.set(task.dueDate, list)
    }
    return map
  }, [tasks])
  const selectedTasks = tasksByDate.get(selected) ?? []

  const select = (key: DateKey, focus = false) => {
    setSelected(key)
    const date = parseDateKey(key)
    if (!isSameMonth(date, month)) setMonth(startOfMonth(date))
    if (focus) requestAnimationFrame(() => gridRef.current?.querySelector<HTMLButtonElement>(`[data-date="${key}"]`)?.focus())
  }

  const onGridKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = KEY_STEPS[event.key]
    if (step === undefined) return
    event.preventDefault()
    select(addDaysToKey(selected, step), true)
  }

  const goMonth = (offset: number) => {
    const next = addMonths(month, offset)
    setMonth(next)
    setSelected(toDateKey(next))
  }

  return (
    <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_300px]">
      <Card className="overflow-hidden">
        <div className="flex h-11 items-center justify-between gap-2 border-b border-line px-3">
          <h3 className="text-lg font-semibold text-fg" aria-live="polite">
            {formatMonthYear(month)}
          </h3>
          <div className="flex items-center gap-1">
            <Button variant="secondary" size="sm" onClick={() => select(today, true)}>
              {t('calendar_today')}
            </Button>
            <IconButton label={t('calendar_previous_month')} size="sm" onClick={() => goMonth(-1)}>
              <ChevronLeft />
            </IconButton>
            <IconButton label={t('calendar_next_month')} size="sm" onClick={() => goMonth(1)}>
              <ChevronRight />
            </IconButton>
          </div>
        </div>
        <div role="grid" aria-label={formatMonthYear(month)} ref={gridRef} onKeyDown={onGridKeyDown}>
          <div role="row" className="grid grid-cols-7 border-b border-line bg-surface-2">
            {getWeekdayLabels(weekStartsOn).map((label) => (
              <div key={label} role="columnheader" className="py-1.5 text-center text-[10px] font-medium tracking-wide text-fg-3 uppercase">
                {label}
              </div>
            ))}
          </div>
          {weeks.map((week) => (
            <div key={toDateKey(week[0] ?? month)} role="row" className="grid grid-cols-7 border-b border-line last:border-b-0">
              {week.map((day) => {
                const key = toDateKey(day)
                const dayTasks = tasksByDate.get(key) ?? []
                const inMonth = isSameMonth(day, month)
                const isSelected = key === selected
                const open = dayTasks.filter((task) => !isTaskDone(task)).length
                return (
                  <div
                    key={key}
                    role="gridcell"
                    aria-selected={isSelected}
                    className={cn(
                      'flex min-h-14 flex-col gap-0.5 border-r border-line p-1 last:border-r-0 sm:min-h-24',
                      !inMonth && 'bg-surface-2',
                      isSelected && 'bg-brand-soft/60',
                    )}
                  >
                    <button
                      type="button"
                      data-date={key}
                      tabIndex={isSelected ? 0 : -1}
                      onClick={() => select(key)}
                      aria-label={dayTasks.length ? t('calendar_day_label', { date: formatLongDate(key), count: dayTasks.length }) : formatLongDate(key)}
                      className={cn(
                        'tabular flex size-6 items-center justify-center self-center rounded-control text-xs font-medium transition-colors sm:self-start',
                        key === today
                          ? 'bg-brand text-white'
                          : isSelected
                            ? 'bg-surface text-brand-ink ring-1 ring-brand/40'
                            : inMonth
                              ? 'text-fg hover:bg-surface-3'
                              : 'text-fg-3 hover:bg-surface-3',
                      )}
                    >
                      {formatDayOfMonth(day)}
                    </button>
                    {/* Mobile: dots. Desktop: task chips. */}
                    {dayTasks.length > 0 && (
                      <div className="flex justify-center gap-0.5 sm:hidden" aria-hidden>
                        {dayTasks.slice(0, 3).map((task) => (
                          <span
                            key={task.id}
                            className={cn(
                              'size-1.5 rounded-full',
                              isTaskDone(task) ? 'bg-emerald-500' : key < today ? 'bg-rose-500' : 'bg-brand',
                            )}
                          />
                        ))}
                      </div>
                    )}
                    <ul className="hidden flex-col gap-0.5 sm:flex">
                      {dayTasks.slice(0, MAX_CHIPS).map((task) => {
                        const done = isTaskDone(task)
                        const overdue = !done && key < today
                        return (
                          <li key={task.id}>
                            <button
                              type="button"
                              tabIndex={-1}
                              onClick={() => openTask(task.id)}
                              title={task.title}
                              className={cn(
                                'block w-full truncate rounded-control px-1.5 py-0.5 text-left text-[11px] font-medium transition-colors',
                                done
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
                                  : overdue
                                    ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-300'
                                    : 'bg-brand-soft text-brand-ink hover:bg-brand-soft/70',
                              )}
                            >
                              {task.title}
                            </button>
                          </li>
                        )
                      })}
                      {dayTasks.length > MAX_CHIPS && (
                        <li>
                          <button type="button" tabIndex={-1} onClick={() => select(key)} className="px-1.5 text-[11px] font-medium text-fg-3 hover:text-fg">
                            {t('calendar_more', { count: dayTasks.length - MAX_CHIPS })}
                          </button>
                        </li>
                      )}
                    </ul>
                    {open > 0 && <span className="sr-only">{t('calendar_open_count', { count: open })}</span>}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </Card>

      <Card className="flex flex-col self-start">
        <div className="flex h-11 items-center justify-between gap-2 border-b border-line px-3">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-fg">{formatLongDate(selected)}</h3>
            <p className="text-xs text-fg-3">
              {selectedTasks.length === 0 ? t('calendar_no_tasks_due') : t('calendar_tasks_due', { count: selectedTasks.length })}
            </p>
          </div>
          <Button size="sm" variant="soft" leftIcon={<CalendarPlus />} onClick={() => openCreateTask({ dueDate: selected, projectId })}>
            {t('calendar_add')}
          </Button>
        </div>
        <div>
          {selectedTasks.length === 0 ? (
            <p className="px-3 py-5 text-center text-sm text-fg-3">{t('calendar_select_day_hint')}</p>
          ) : (
            <ul className="flex flex-col divide-y divide-line">
              {selectedTasks.map((task) => (
                <li key={task.id}>
                  <TaskRow task={task} today={today} showProject={false} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>
    </div>
  )
}
