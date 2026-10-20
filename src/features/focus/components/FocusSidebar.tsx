import { CircleCheck, CircleDashed, Flame, History, Star } from 'lucide-react'
import { useMemo } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { selectTaskEntities } from '@/features/tasks/taskSelectors'
import type { Task } from '@/features/tasks/taskTypes'
import { formatRelativeTime, timestampToDateKey } from '@/lib/date'
import { formatMinutes } from '@/lib/format'
import { cn } from '@/lib/cn'
import { useTranslation } from '@/i18n/useTranslation'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import type { DateKey } from '@/types/common'
import { timerTaskSelected } from '../focusSlice'

export function FocusStats({ today }: { today: DateKey }) {
  const { t } = useTranslation()
  const sessions = useAppSelector((state) => state.focus.sessions)
  const stats = useMemo(() => {
    const completed = sessions.filter((session) => session.status === 'completed')
    const todays = sessions.filter((session) => timestampToDateKey(session.startedAt) === today)
    return {
      todayMinutes: todays.reduce((sum, session) => sum + session.durationMinutes, 0),
      todaySessions: todays.filter((session) => session.status === 'completed').length,
      completedSessions: completed.length,
      totalMinutes: sessions.reduce((sum, session) => sum + session.durationMinutes, 0),
    }
  }, [sessions, today])

  const items = [
    { label: t('focus_stats_today_minutes'), value: formatMinutes(stats.todayMinutes) },
    { label: t('focus_stats_today_sessions'), value: stats.todaySessions },
    { label: t('focus_stats_completed_sessions'), value: stats.completedSessions },
    { label: t('focus_stats_total_time'), value: formatMinutes(stats.totalMinutes) },
  ]

  return (
    <Card>
      <CardHeader title={t('focus_stats_title')} icon={<Flame />} />
      <CardBody>
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-menu border border-line bg-line sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
          {items.map((item) => (
            <div key={item.label} className="bg-surface px-3 py-2">
              <dt className="text-xs text-fg-3">{item.label}</dt>
              <dd className="tabular text-base font-semibold text-fg">{item.value}</dd>
            </div>
          ))}
        </dl>
      </CardBody>
    </Card>
  )
}

export function FocusPriorities({ tasks, selectedId, locked }: { tasks: Task[]; selectedId: string | null; locked: boolean }) {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  return (
    <Card>
      <CardHeader title={t('focus_priorities_title')} description={t('focus_priorities_hint')} icon={<Star />} />
      <CardBody className="px-1.5 pb-2">
        {tasks.length === 0 ? (
          <p className="px-3 py-2 text-sm text-fg-3">{t('focus_priorities_empty')}</p>
        ) : (
          <ul className="flex flex-col gap-0.5">
            {tasks.map((task) => {
              const selected = task.id === selectedId
              return (
                <li key={task.id}>
                  <button
                    type="button"
                    aria-pressed={selected}
                    onClick={() => dispatch(timerTaskSelected(selected ? null : task.id))}
                    className={cn(
                      'flex h-8 w-full items-center gap-2 rounded-control px-2 text-left text-sm transition-colors',
                      selected ? 'bg-brand-soft font-medium text-brand-ink' : 'text-fg hover:bg-surface-2',
                    )}
                  >
                    {selected ? <CircleCheck className="size-3.5 shrink-0" aria-hidden /> : <CircleDashed className="size-3.5 shrink-0 text-fg-3" aria-hidden />}
                    <span className="truncate">{task.title}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
        {locked && <p className="px-3 pt-2 text-xs text-fg-3">{t('focus_priorities_locked')}</p>}
      </CardBody>
    </Card>
  )
}

export function SessionHistory() {
  const { t } = useTranslation()
  const sessions = useAppSelector((state) => state.focus.sessions)
  const tasks = useAppSelector(selectTaskEntities)
  const recent = useMemo(() => [...sessions].sort((a, b) => b.startedAt.localeCompare(a.startedAt)).slice(0, 8), [sessions])

  return (
    <Card>
      <CardHeader title={t('focus_history_title')} icon={<History />} />
      <CardBody className="px-0 pb-1">
        {recent.length === 0 ? (
          <EmptyState compact icon={<History />} title={t('focus_history_empty_title')} description={t('focus_history_empty_description')} />
        ) : (
          <ul className="flex flex-col divide-y divide-line border-t border-line">
            {recent.map((session) => {
              const task = session.taskId ? tasks[session.taskId] : undefined
              return (
                <li key={session.id} className="flex items-center gap-2.5 px-3.5 py-1.5">
                  <span
                    className={cn('size-1.5 shrink-0 rounded-full', session.status === 'completed' ? 'bg-emerald-500' : 'bg-amber-500')}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-fg">
                      {task?.title ?? (session.taskId ? t('focus_history_deleted_task') : t('focus_history_general'))}
                    </p>
                    <p className="text-xs text-fg-3">{formatRelativeTime(session.endedAt)}</p>
                  </div>
                  <span className="tabular text-sm font-medium text-fg">{formatMinutes(session.durationMinutes)}</span>
                  {session.status === 'interrupted' && <Badge tone="warning">{t('focus_history_stopped')}</Badge>}
                </li>
              )
            })}
          </ul>
        )}
      </CardBody>
    </Card>
  )
}
