import type { TooltipContentProps } from 'recharts'
import { formatNumber } from '@/lib/format'

type ChartTooltipProps = Partial<Pick<TooltipContentProps<number, string>, 'active' | 'payload' | 'label'>> & {
  labelFormatter?: (label: string) => string
  valueFormatter?: (value: number) => string
}

/** Tooltip styled with app tokens. Text uses text colors; the swatch carries series identity. */
export function ChartTooltip({ active, payload, label, labelFormatter, valueFormatter = formatNumber }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null
  const title = label === undefined ? '' : labelFormatter ? labelFormatter(String(label)) : String(label)
  return (
    <div className="min-w-32 rounded-menu border border-line bg-surface px-2.5 py-1.5 text-xs shadow-pop">
      {title && <p className="mb-1 font-medium text-fg">{title}</p>}
      <ul className="flex flex-col gap-1">
        {payload.map((entry) => (
          <li key={String(entry.dataKey ?? entry.name)} className="flex items-center gap-2 text-fg-2">
            <span className="size-2 rounded-[2px]" style={{ background: entry.color ?? entry.fill }} aria-hidden />
            <span className="flex-1">{entry.name}</span>
            <span className="tabular font-semibold text-fg">
              {typeof entry.value === 'number' ? valueFormatter(entry.value) : String(entry.value ?? '')}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
