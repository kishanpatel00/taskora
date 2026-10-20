import { useMemo } from 'react'
import { STATUS_DOT_COLORS } from '@/components/shared/badgeStyles'
import { Card, CardHeader } from '@/components/ui/Card'
import { STATUS_LABEL_KEYS, TASK_STATUSES, type Task } from '@/features/tasks/taskTypes'
import i18n from '@/i18n'
import { useTranslation } from '@/i18n/useTranslation'
import { isTaskOverdue } from '@/features/tasks/taskUtils'
import { addDaysToKey } from '@/lib/date'
import { cn } from '@/lib/cn'
import { formatMinutes, formatPercent } from '@/lib/format'
import { useAppSelector } from '@/store/hooks'
import type { DateKey } from '@/types/common'
import { buildDailySeries, computeSummary, priorityDistribution } from '../insightsUtils'
import { CreatedVsCompletedChart, PriorityChart } from './InsightCharts'

const RANGE_DAYS = 30

interface ProjectInsightsProps {
  tasks: Task[]
  today: DateKey
}

/** Project-scoped analytics for the workspace "Insights" tab (last 30 days + current state). */
export function ProjectInsights({ tasks, today }: ProjectInsightsProps) {
  const { t } = useTranslation()
  const allSessions = useAppSelector((state) => state.focus.sessions)

  const data = useMemo(() => {
    const ids = new Set(tasks.map((task) => task.id))
    const sessions = allSessions.filter((session) => session.taskId !== null && ids.has(session.taskId))
    const start = addDaysToKey(today, -(RANGE_DAYS - 1))
    const total = tasks.length
    const done = tasks.filter((task) => task.status === 'done').length
    return {
      summary: computeSummary(tasks, sessions, start, today),
      daily: buildDailySeries(tasks, sessions, start, today),
      priorities: priorityDistribution(tasks),
      statuses: TASK_STATUSES.map((status) => ({ status, count: tasks.filter((task) => task.status === status).length })),
      overdue: tasks.filter((task) => isTaskOverdue(task, today)).length,
      completion: total === 0 ? 0 : (done / total) * 100,
      total,
    }
  }, [tasks, allSessions, today])

  const kpis = [
    { label: t('project_insights_completion'), value: formatPercent(data.completion) },
    { label: t('project_insights_completed_range', { days: RANGE_DAYS }), value: String(data.summary.completed) },
    { label: t('project_insights_overdue'), value: String(data.overdue), danger: data.overdue > 0 },
    {
      label: t('project_insights_avg_completion'),
      value:
        data.summary.avgCompletionHours === null
          ? '—'
          : i18n.t('format_duration_days_decimal', { value: (data.summary.avgCompletionHours / 24).toFixed(1) }),
    },
    { label: t('project_insights_focus_range', { days: RANGE_DAYS }), value: formatMinutes(data.summary.focusMinutes) },
  ]

  return (
    <div className="flex flex-col gap-3">
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-panel border border-line bg-line sm:grid-cols-5 [&>div:last-child]:col-span-2 sm:[&>div:last-child]:col-span-1">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-surface px-3.5 py-2">
            <dt className="text-xs text-fg-3">{kpi.label}</dt>
            <dd className={cn('tabular text-base font-semibold', kpi.danger ? 'text-rose-600 dark:text-rose-400' : 'text-fg')}>{kpi.value}</dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-3 lg:grid-cols-3">
        <CreatedVsCompletedChart data={data.daily} bucket="day" />
        <PriorityChart data={data.priorities} />
      </div>

      <Card>
        <CardHeader title={t('project_insights_status_breakdown')} description={t('project_insights_task_count', { count: data.total })} className="border-b border-line" />
        <div className="flex flex-col gap-2.5 p-3.5">
          <div className="flex h-2 overflow-hidden rounded-full bg-surface-3" aria-hidden>
            {data.statuses.map(({ status, count }) =>
              count === 0 ? null : (
                <span key={status} className={cn('h-full border-r-2 border-surface last:border-r-0', STATUS_DOT_COLORS[status])} style={{ width: `${(count / Math.max(1, data.total)) * 100}%` }} />
              ),
            )}
          </div>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-4">
            {data.statuses.map(({ status, count }) => (
              <li key={status} className="flex items-center gap-1.5 text-xs text-fg-2">
                <span className={cn('size-2 rounded-[2px]', STATUS_DOT_COLORS[status])} aria-hidden />
                {t(STATUS_LABEL_KEYS[status])}
                <span className="tabular ml-auto font-medium text-fg sm:ml-1">{count}</span>
              </li>
            ))}
          </ul>
        </div>
      </Card>
    </div>
  )
}
