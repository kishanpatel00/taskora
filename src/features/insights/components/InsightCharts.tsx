import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartCard, LegendItem } from '@/components/charts/ChartCard'
import { ChartTooltip } from '@/components/charts/ChartTooltip'
import { PROJECT_COLOR_STYLES } from '@/features/projects/projectStyles'
import type { Project, ProjectProgress } from '@/features/projects/projectTypes'
import type { TaskPriority } from '@/features/tasks/taskTypes'
import type { TranslationKey } from '@/i18n/translation.types'
import { useTranslation } from '@/i18n/useTranslation'
import { formatMonthDay, formatWeekdayDate } from '@/lib/date'
import { formatNumber } from '@/lib/format'
import type { DateKey } from '@/types/common'

const axisTick = { fill: 'var(--fg-3)', fontSize: 12 }
const shortDate = (date: string) => formatMonthDay(date)
const longDate = (date: string) => formatWeekdayDate(date)

function NoData({ message }: { message: string }) {
  return <div className="flex h-40 items-center justify-center rounded-menu border border-dashed border-line-strong text-sm text-fg-3">{message}</div>
}

export function CreatedVsCompletedChart({
  data,
  bucket,
}: {
  data: Array<{ date: DateKey; created: number; completed: number }>
  bucket: 'day' | 'week'
}) {
  const { t } = useTranslation()
  const created = data.reduce((sum, point) => sum + point.created, 0)
  const completed = data.reduce((sum, point) => sum + point.completed, 0)
  const label = (date: string) => (bucket === 'week' ? t('chart_week_of', { date: shortDate(date) }) : longDate(date))
  return (
    <ChartCard
      className="lg:col-span-2"
      title={t('chart_created_completed_title')}
      description={t(bucket === 'week' ? 'chart_created_completed_description_week' : 'chart_created_completed_description_day', { created, completed })}
      summary={t('chart_created_completed_summary', { created, completed })}
      table={{ columns: [bucket === 'week' ? t('chart_column_week') : t('chart_column_day'), t('chart_series_created'), t('chart_series_completed')], rows: data.map((point) => [label(point.date), point.created, point.completed]) }}
      legend={
        <>
          <LegendItem color="var(--chart-1)" label={t('chart_series_completed')} />
          <LegendItem color="var(--chart-2)" label={t('chart_series_created')} />
        </>
      }
    >
      {created + completed === 0 ? (
        <NoData message={t('chart_created_completed_empty')} />
      ) : (
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barGap={2} barCategoryGap="22%" margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
              <CartesianGrid vertical={false} stroke="var(--line)" />
              <XAxis dataKey="date" tickFormatter={shortDate} tickLine={false} axisLine={false} tick={axisTick} minTickGap={16} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={axisTick} />
              <Tooltip cursor={{ fill: 'var(--surface-2)' }} content={<ChartTooltip labelFormatter={label} />} />
              <Bar dataKey="completed" name={t('chart_series_completed')} fill="var(--chart-1)" radius={[4, 4, 0, 0]} maxBarSize={18} />
              <Bar dataKey="created" name={t('chart_series_created')} fill="var(--chart-2)" radius={[4, 4, 0, 0]} maxBarSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  )
}

export function WeeklyTrendChart({ data }: { data: Array<{ weekStart: DateKey; completed: number }> }) {
  const { t } = useTranslation()
  const best = data.reduce((max, point) => Math.max(max, point.completed), 0)
  const average = data.length === 0 ? 0 : data.reduce((sum, point) => sum + point.completed, 0) / data.length
  return (
    <ChartCard
      title={t('chart_trend_title')}
      description={t('chart_trend_description', { average: formatNumber(Number(average.toFixed(1))), best })}
      summary={t('chart_trend_summary', { weeks: data.length, average: formatNumber(Number(average.toFixed(1))), best })}
      table={{ columns: [t('chart_column_week_of'), t('chart_series_completed')], rows: data.map((point) => [shortDate(point.weekStart), point.completed]) }}
    >
      {best === 0 ? (
        <NoData message={t('chart_trend_empty')} />
      ) : (
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -24 }}>
              <defs>
                <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="var(--line)" />
              <XAxis dataKey="weekStart" tickFormatter={shortDate} tickLine={false} axisLine={false} tick={axisTick} minTickGap={20} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={axisTick} />
              <Tooltip
                cursor={{ stroke: 'var(--line-strong)' }}
                content={<ChartTooltip labelFormatter={(date) => t('chart_week_of', { date: shortDate(date) })} />}
              />
              <Area
                type="monotone"
                dataKey="completed"
                name={t('chart_series_completed')}
                stroke="var(--chart-1)"
                strokeWidth={2}
                fill="url(#trendFill)"
                dot={{ r: 3, fill: 'var(--chart-1)', stroke: 'var(--surface)', strokeWidth: 2 }}
                activeDot={{ r: 5, stroke: 'var(--surface)', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  )
}

/** Ordinal single-hue ramp: more important priorities are darker (lighter on dark). */
const PRIORITY_RAMP: Record<TaskPriority, string> = {
  low: 'var(--seq-1)',
  medium: 'var(--seq-2)',
  high: 'var(--seq-3)',
  urgent: 'var(--seq-4)',
}

export function PriorityChart({ data: raw }: { data: Array<{ priority: TaskPriority; labelKey: TranslationKey; count: number }> }) {
  const { t } = useTranslation()
  const data = raw.map((item) => ({ ...item, label: t(item.labelKey) }))
  const total = data.reduce((sum, item) => sum + item.count, 0)
  return (
    <ChartCard
      title={t('chart_priority_title')}
      description={t('chart_priority_description', { count: total })}
      summary={data.map((item) => `${item.label}: ${item.count}`).join(', ')}
      table={{ columns: [t('chart_column_priority'), t('chart_series_open_tasks')], rows: data.map((item) => [item.label, item.count]) }}
    >
      {total === 0 ? (
        <NoData message={t('chart_priority_empty')} />
      ) : (
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" barCategoryGap="24%" margin={{ top: 0, right: 28, bottom: 0, left: 0 }}>
              <XAxis type="number" hide allowDecimals={false} />
              <YAxis type="category" dataKey="label" tickLine={false} axisLine={false} tick={axisTick} width={64} />
              <Tooltip cursor={{ fill: 'var(--surface-2)' }} content={<ChartTooltip />} />
              <Bar
                dataKey="count"
                name={t('chart_series_open_tasks')}
                radius={[0, 4, 4, 0]}
                maxBarSize={20}
                label={{ position: 'right', fill: 'var(--fg-2)', fontSize: 12 }}
              >
                {data.map((item) => (
                  <Cell key={item.priority} fill={PRIORITY_RAMP[item.priority]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  )
}

export function ProjectProgressChart({ projects, progress }: { projects: Project[]; progress: Record<string, ProjectProgress> }) {
  const { t } = useTranslation()
  const data = projects.map((project) => ({
    id: project.id,
    name: project.name,
    percent: progress[project.id]?.percent ?? 0,
    tasks: progress[project.id]?.total ?? 0,
    color: PROJECT_COLOR_STYLES[project.color].hex,
  }))
  return (
    <ChartCard
      title={t('chart_projects_title')}
      description={t('chart_projects_description')}
      summary={data.map((item) => `${item.name}: ${item.percent}%`).join(', ')}
      table={{ columns: [t('chart_column_project'), t('chart_column_progress'), t('chart_column_tasks')], rows: data.map((item) => [item.name, `${item.percent}%`, item.tasks]) }}
    >
      {data.length === 0 ? (
        <NoData message={t('chart_projects_empty')} />
      ) : (
        <div style={{ height: Math.max(120, data.length * 32) }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" barCategoryGap="28%" margin={{ top: 0, right: 40, bottom: 0, left: 0 }}>
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} tick={axisTick} width={140} />
              <Tooltip cursor={{ fill: 'var(--surface-2)' }} content={<ChartTooltip valueFormatter={(value) => `${value}%`} />} />
              <Bar
                dataKey="percent"
                name={t('chart_series_progress')}
                radius={[0, 4, 4, 0]}
                maxBarSize={14}
                background={{ fill: 'var(--surface-2)', radius: 4 }}
                label={{ position: 'right', fill: 'var(--fg-2)', fontSize: 12, formatter: (value: unknown) => `${String(value)}%` }}
              >
                {data.map((item) => (
                  <Cell key={item.id} fill={item.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  )
}
