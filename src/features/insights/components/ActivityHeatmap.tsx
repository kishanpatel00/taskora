import { useState } from 'react'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import i18n from '@/i18n'
import { useTranslation } from '@/i18n/useTranslation'
import { formatWeekdayDate, getWeekdayLabels } from '@/lib/date'
import { cn } from '@/lib/cn'
import type { WeekStartsOn } from '@/types/common'
import type { HeatmapCell } from '../insightsUtils'

const LEVEL_COLORS = ['var(--seq-0)', 'var(--seq-1)', 'var(--seq-2)', 'var(--seq-3)', 'var(--seq-4)'] as const

interface ActivityHeatmapProps {
  columns: HeatmapCell[][]
  weekStartsOn: WeekStartsOn
  className?: string
}

const describe = (cell: HeatmapCell) =>
  cell.count === 0
    ? i18n.t('heatmap_no_activity', { date: formatWeekdayDate(cell.date) })
    : i18n.t('heatmap_activity', { date: formatWeekdayDate(cell.date), count: cell.count })

/** GitHub-style calendar heatmap. Activity = tasks completed + focus sessions. */
export function ActivityHeatmap({ columns, weekStartsOn, className }: ActivityHeatmapProps) {
  const { t } = useTranslation()
  const [hovered, setHovered] = useState<HeatmapCell | null>(null)
  const cells = columns.flat().filter((cell) => !cell.future)
  const activeDays = cells.filter((cell) => cell.count > 0).length
  const total = cells.reduce((sum, cell) => sum + cell.count, 0)
  const weekdays = getWeekdayLabels(weekStartsOn, 'short')

  return (
    <Card className={className}>
      <CardHeader
        title={t('heatmap_title')}
        description={t('heatmap_description', { weeks: columns.length, days: activeDays, total })}
      />
      <CardBody>
        <p className="sr-only">
          {t('heatmap_summary', { days: activeDays, total_days: cells.length, total })}
        </p>
        <div className="flex gap-1.5" aria-hidden>
          <div className="grid grid-rows-7 gap-[3px] text-[10px] text-fg-3">
            {weekdays.map((label, index) => (
              <span key={label} className="flex items-center">
                {index % 2 === 0 ? label : ''}
              </span>
            ))}
          </div>
          {/* Columns share the available width, so the grid scales from phones to wide screens. */}
          <div className="grid flex-1 gap-[3px]" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`, maxWidth: columns.length * 20 }}>
            {columns.map((column) => (
              <div key={column[0]?.date} className="grid grid-rows-7 gap-[3px]">
                {column.map((cell) => (
                  <span
                    key={cell.date}
                    title={cell.future ? undefined : describe(cell)}
                    onMouseEnter={() => setHovered(cell.future ? null : cell)}
                    onMouseLeave={() => setHovered(null)}
                    className={cn('aspect-square w-full rounded-[2px] transition-transform hover:scale-110', cell.future && 'opacity-0')}
                    style={{ background: LEVEL_COLORS[cell.level] }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-fg-3">
          <span className="min-h-4 text-fg-2" aria-live="polite">
            {hovered ? describe(hovered) : t('heatmap_hover_hint')}
          </span>
          <span className="flex items-center gap-1.5" aria-hidden>
            {t('heatmap_less')}
            {LEVEL_COLORS.map((color) => (
              <span key={color} className="size-2.5 rounded-[2px]" style={{ background: color }} />
            ))}
            {t('heatmap_more')}
          </span>
        </div>
      </CardBody>
    </Card>
  )
}
