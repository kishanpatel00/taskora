import { Check, GripVertical } from 'lucide-react'
import { STATUS_DOT_COLORS } from '@/components/shared/badgeStyles'
import { PriorityBadge } from '@/components/shared/PriorityBadge'
import { STATUS_LABEL_KEYS } from '@/features/tasks/taskTypes'
import { useTranslation } from '@/i18n/useTranslation'
import { cn } from '@/lib/cn'
import { SHOWCASE_COLUMNS } from '../data/landingContent'
import { Reveal } from './Reveal'
import { SectionHeading } from './SectionHeading'

/** Product tour: a miniature Kanban board next to the key points. */
export function ProductShowcase() {
  const { t } = useTranslation()
  const points = [t('landing_showcase_point_drag'), t('landing_showcase_point_views'), t('landing_showcase_point_filters')]

  return (
    <section aria-labelledby="landing-showcase-title" className="border-b border-line bg-bg">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:py-20">
        <Reveal>
          <SectionHeading
            id="landing-showcase-title"
            align="left"
            eyebrow={t('landing_showcase_eyebrow')}
            title={t('landing_showcase_title')}
            subtitle={t('landing_showcase_subtitle')}
          />
          <ul className="mt-5 flex flex-col gap-2.5">
            {points.map((point) => (
              <li key={point} className="flex items-start gap-2 text-sm text-fg-2">
                <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand-ink" aria-hidden>
                  <Check className="size-3" />
                </span>
                {point}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={120}>
          <figure className="m-0" aria-label={t('landing_showcase_label')}>
            <div className="grid grid-cols-3 gap-2 rounded-panel border border-line bg-surface p-2 shadow-pop" aria-hidden>
              {SHOWCASE_COLUMNS.map((column) => (
                <div key={column.status} className="flex min-w-0 flex-col rounded-menu border border-line bg-surface-2">
                  <p className="flex items-center gap-1.5 border-b border-line px-2 py-1.5 text-[10px] font-semibold tracking-wide text-fg-2 uppercase">
                    <span className={cn('size-1.5 rounded-full', STATUS_DOT_COLORS[column.status])} />
                    <span className="truncate">{t(STATUS_LABEL_KEYS[column.status])}</span>
                    <span className="tabular ml-auto font-medium">{column.cards.length}</span>
                  </p>
                  <div className="flex flex-col gap-1.5 p-1.5">
                    {column.cards.map((card, index) => (
                      <div
                        key={card.titleKey}
                        className={cn(
                          'rounded-control border border-line bg-surface p-2 shadow-xs transition-colors hover:border-line-strong',
                          column.status === 'in_progress' && index === 0 && 'border-brand/50 ring-2 ring-brand/15',
                        )}
                      >
                        <div className="flex items-start gap-1">
                          <span className="min-w-0 flex-1 text-[11px] leading-4 font-medium text-fg">{t(card.titleKey)}</span>
                          <GripVertical className="size-3 shrink-0 text-fg-3" />
                        </div>
                        <PriorityBadge priority={card.priority} className="mt-1.5 text-[10px]" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </figure>
        </Reveal>
      </div>
    </section>
  )
}
