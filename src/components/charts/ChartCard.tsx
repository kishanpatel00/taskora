import { ChartColumn, Table } from 'lucide-react'
import { useId, useState, type ReactNode } from 'react'
import { IconButton } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { useTranslation } from '@/i18n/useTranslation'

export interface ChartTable {
  columns: string[]
  rows: Array<Array<string | number>>
}

interface ChartCardProps {
  title: string
  description?: string
  /** One-sentence plain-language summary for screen readers. */
  summary: string
  table: ChartTable
  legend?: ReactNode
  children: ReactNode
  className?: string
  action?: ReactNode
}

/** Chart container with an accessible summary and a chart ⇄ table toggle. */
export function ChartCard({ title, description, summary, table, legend, children, className, action }: ChartCardProps) {
  const { t } = useTranslation()
  const [showTable, setShowTable] = useState(false)
  const summaryId = useId()

  return (
    <Card className={className}>
      <CardHeader
        title={title}
        description={description}
        action={
          <>
            {action}
            <IconButton
              label={showTable ? t('common_show_chart') : t('common_show_table')}
              size="sm"
              aria-pressed={showTable}
              onClick={() => setShowTable((value) => !value)}
            >
              {showTable ? <ChartColumn /> : <Table />}
            </IconButton>
          </>
        }
      />
      <CardBody>
        <p id={summaryId} className="sr-only">
          {summary}
        </p>
        {showTable ? (
          <div className="max-h-72 overflow-auto rounded-control border border-line scrollbar-thin">
            <table className="w-full text-left text-xs">
              <caption className="sr-only">{title}</caption>
              <thead className="sticky top-0 bg-surface-2 text-fg-2">
                <tr>
                  {table.columns.map((column) => (
                    <th key={column} scope="col" className="px-2.5 py-1.5 font-medium">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {table.rows.map((row, index) => (
                  <tr key={index}>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="tabular px-2.5 py-1 text-fg">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <figure aria-describedby={summaryId} className="m-0">
            {legend && <div className="mb-2 flex flex-wrap gap-3 text-xs text-fg-2">{legend}</div>}
            {children}
          </figure>
        )}
      </CardBody>
    </Card>
  )
}

export function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="size-2 rounded-[2px]" style={{ background: color }} aria-hidden />
      {label}
    </span>
  )
}
