import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartCard, LegendItem } from '@/components/charts/ChartCard'
import { ChartTooltip } from '@/components/charts/ChartTooltip'
import type { DailyPoint } from '@/features/insights/insightsUtils'
import { useTranslation } from '@/i18n/useTranslation'
import { formatLongDate, formatWeekday } from '@/lib/date'

interface WeeklyChartProps {
  data: DailyPoint[]
  completedThisWeek: number
  completedPreviousWeek: number
}

const dayLabel = (date: string) => formatWeekday(date)
const longLabel = (date: string) => formatLongDate(date)

export function WeeklyChart({ data, completedThisWeek, completedPreviousWeek }: WeeklyChartProps) {
  const { t } = useTranslation()
  const created = data.reduce((sum, point) => sum + point.created, 0)
  const delta = completedThisWeek - completedPreviousWeek
  const trend =
    completedPreviousWeek === 0 && completedThisWeek === 0
      ? t('chart_trend_none')
      : delta === 0
        ? t('chart_trend_same')
        : t('chart_trend_delta', { delta: `${delta > 0 ? '+' : ''}${delta}` })

  return (
    <ChartCard
      className="lg:col-span-2"
      title={t('chart_weekly_title')}
      description={t('chart_weekly_description', { completed: completedThisWeek, created, trend })}
      summary={t('chart_weekly_summary', { completed: completedThisWeek, created, trend })}
      table={{
        columns: [t('chart_column_day'), t('chart_series_completed'), t('chart_series_created')],
        rows: data.map((point) => [longLabel(point.date), point.completed, point.created]),
      }}
      legend={
        <>
          <LegendItem color="var(--chart-1)" label={t('chart_series_completed')} />
          <LegendItem color="var(--chart-2)" label={t('chart_series_created')} />
        </>
      }
    >
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={2} barCategoryGap="30%" margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
            <CartesianGrid vertical={false} stroke="var(--line)" />
            <XAxis dataKey="date" tickFormatter={dayLabel} tickLine={false} axisLine={false} tick={{ fill: 'var(--fg-3)', fontSize: 12 }} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: 'var(--fg-3)', fontSize: 12 }} />
            <Tooltip cursor={{ fill: 'var(--surface-2)' }} content={<ChartTooltip labelFormatter={longLabel} />} />
            <Bar dataKey="completed" name={t('chart_series_completed')} fill="var(--chart-1)" radius={[4, 4, 0, 0]} maxBarSize={16} />
            <Bar dataKey="created" name={t('chart_series_created')} fill="var(--chart-2)" radius={[4, 4, 0, 0]} maxBarSize={16} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  )
}
