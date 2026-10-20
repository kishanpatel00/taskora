import { ChartColumn, CircleCheckBig, Clock, Flame, Percent, Timer, TriangleAlert } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Tabs } from '@/components/ui/Tabs'
import { selectAllProjects, selectProjectProgressMap } from '@/features/projects/projectSelectors'
import { selectAllTasks, selectOverdueTasks } from '@/features/tasks/taskSelectors'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useToday } from '@/hooks/useToday'
import { addDaysToKey, formatShortDate } from '@/lib/date'
import { formatMinutes, formatNumber, formatPercent } from '@/lib/format'
import i18n from '@/i18n'
import { useTranslation } from '@/i18n/useTranslation'
import { useAppSelector } from '@/store/hooks'
import { ActivityHeatmap } from './components/ActivityHeatmap'
import { CreatedVsCompletedChart, PriorityChart, ProjectProgressChart, WeeklyTrendChart } from './components/InsightCharts'
import {
  buildDailySeries,
  buildHeatmap,
  computeSummary,
  groupByWeek,
  MIN_COMPLETION_SAMPLES,
  priorityDistribution,
} from './insightsUtils'

type Range = '7' | '30' | '90'

const TREND_WEEKS = 12
const HEATMAP_WEEKS = 26

function formatHours(hours: number): string {
  if (hours < 1) return formatMinutes(hours * 60)
  if (hours < 48) return i18n.t('format_duration_hours_decimal', { value: formatNumber(Number(hours.toFixed(1))) })
  return i18n.t('format_duration_days_decimal', { value: formatNumber(Number((hours / 24).toFixed(1))) })
}

export default function InsightsPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('insights_title'))
  const rangeTabs = [
    { value: '7', label: t('insights_range_7') },
    { value: '30', label: t('insights_range_30') },
    { value: '90', label: t('insights_range_90') },
  ] as const
  const today = useToday()
  const [range, setRange] = useState<Range>('30')
  const tasks = useAppSelector(selectAllTasks)
  const projects = useAppSelector(selectAllProjects)
  const progress = useAppSelector(selectProjectProgressMap)
  const sessions = useAppSelector((state) => state.focus.sessions)
  const overdue = useAppSelector((state) => selectOverdueTasks(state, today).length)
  const weekStartsOn = useAppSelector((state) => state.settings.weekStartsOn)

  const start = addDaysToKey(today, -(Number(range) - 1))

  const data = useMemo(() => {
    const daily = buildDailySeries(tasks, sessions, start, today)
    const createdVsCompleted =
      range === '90'
        ? groupByWeek(daily, weekStartsOn).map((week) => ({ date: week.weekStart, created: week.created, completed: week.completed }))
        : daily
    const trendDaily = buildDailySeries(tasks, sessions, addDaysToKey(today, -(TREND_WEEKS * 7 - 1)), today)
    return {
      summary: computeSummary(tasks, sessions, start, today),
      createdVsCompleted,
      trend: groupByWeek(trendDaily, weekStartsOn).slice(-TREND_WEEKS),
      heatmap: buildHeatmap(tasks, sessions, today, HEATMAP_WEEKS, weekStartsOn),
      priorities: priorityDistribution(tasks),
    }
  }, [tasks, sessions, start, today, range, weekStartsOn])

  const visibleProjects = useMemo(
    () => [...projects].sort((a, b) => (progress[b.id]?.percent ?? 0) - (progress[a.id]?.percent ?? 0)),
    [projects, progress],
  )

  const { summary } = data

  return (
    <PageContainer>
      <PageHeader
        title={t('insights_title')}
        description={t('insights_description', { start: formatShortDate(start), end: formatShortDate(today) })}
        actions={<Tabs<Range> label={t('insights_range_label')} items={rangeTabs} value={range} onChange={setRange} />}
      />

      {tasks.length === 0 && sessions.length === 0 ? (
        <Card>
          <EmptyState
            icon={<ChartColumn />}
            title={t('insights_empty_title')}
            description={t('insights_empty_description')}
          />
        </Card>
      ) : (
        <>
          <section aria-label={t('insights_summary')} className="grid grid-cols-2 gap-px overflow-hidden rounded-panel border border-line bg-line md:grid-cols-3 xl:grid-cols-6">
            <Kpi icon={<CircleCheckBig />} label={t('insights_kpi_completed')} value={formatNumber(summary.completed)} />
            <Kpi
              icon={<Percent />}
              label={t('insights_kpi_completion_rate')}
              value={summary.completionRate === null ? '—' : formatPercent(summary.completionRate)}
              hint={summary.completionRate === null ? t('insights_kpi_none_created') : t('insights_kpi_of_created', { count: summary.created })}
            />
            <Kpi icon={<TriangleAlert />} label={t('insights_kpi_overdue')} value={formatNumber(overdue)} />
            <Kpi
              icon={<Clock />}
              label={t('insights_kpi_avg_time')}
              value={summary.avgCompletionHours === null ? '—' : formatHours(summary.avgCompletionHours)}
              hint={summary.avgCompletionHours === null ? t('insights_kpi_needs_samples', { count: MIN_COMPLETION_SAMPLES }) : t('insights_kpi_created_to_done')}
            />
            <Kpi icon={<Timer />} label={t('insights_kpi_sessions')} value={formatNumber(summary.focusSessions)} />
            <Kpi icon={<Flame />} label={t('insights_kpi_focus_time')} value={formatMinutes(summary.focusMinutes)} />
          </section>

          <div className="grid gap-3 lg:grid-cols-3">
            <CreatedVsCompletedChart data={data.createdVsCompleted} bucket={range === '90' ? 'week' : 'day'} />
            <PriorityChart data={data.priorities} />
          </div>

          <div className="grid gap-3 lg:grid-cols-3">
            <ActivityHeatmap columns={data.heatmap} weekStartsOn={weekStartsOn} className="lg:col-span-2" />
            <WeeklyTrendChart data={data.trend} />
          </div>

          <ProjectProgressChart projects={visibleProjects} progress={progress} />
        </>
      )}
    </PageContainer>
  )
}

function Kpi({ icon, label, value, hint }: { icon: ReactNode; label: string; value: string; hint?: string }) {
  return (
    <div className="flex flex-col gap-0.5 bg-surface px-3.5 py-2.5">
      <p className="flex items-center gap-1.5 text-xs text-fg-2">
        <span className="text-fg-3 [&_svg]:size-3.5" aria-hidden>
          {icon}
        </span>
        {label}
      </p>
      <p className="tabular text-xl leading-7 font-semibold text-fg">{value}</p>
      <p className="min-h-4 truncate text-[11px] text-fg-3">{hint}</p>
    </div>
  )
}
