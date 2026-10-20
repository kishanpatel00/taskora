import { CalendarClock, CircleCheckBig, Flame, Star, Timer } from 'lucide-react'
import type { ReactNode } from 'react'
import { LogoMark } from '@/components/shared/Logo'
import { PriorityBadge } from '@/components/shared/PriorityBadge'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Checkbox } from '@/components/ui/Checkbox'
import { ProjectDot } from '@/features/projects/components/ProjectAvatar'
import { PROJECT_COLOR_STYLES } from '@/features/projects/projectStyles'
import { useTranslation } from '@/i18n/useTranslation'
import { cn } from '@/lib/cn'
import { formatMinutes, formatNumber } from '@/lib/format'
import { PREVIEW_PROJECTS, PREVIEW_TASKS } from '../data/landingContent'

const delay = (ms: number) => ({ animationDelay: `${ms}ms` })

function Metric({ icon, label, value, highlight = false, ms }: { icon: ReactNode; label: string; value: string; highlight?: boolean; ms: number }) {
  return (
    <div
      className={cn('animate-rise rounded-menu border border-line bg-surface px-2.5 py-2', highlight && 'ring-1 ring-brand/30')}
      style={delay(ms)}
    >
      <p className="flex items-center gap-1 text-[10px] font-medium text-fg-3 [&_svg]:size-3">
        {icon}
        <span className="truncate">{label}</span>
      </p>
      <p className="mt-0.5 text-base font-semibold text-fg">
        {/* Brief tint on the highlighted metric draws the eye once, then settles. */}
        <span className={cn('tabular -mx-1 inline-block rounded-control px-1', highlight && 'animate-highlight')}>{value}</span>
      </p>
    </div>
  )
}

/**
 * Static, decorative miniature of the Overview screen built from the app's real
 * components. Hidden from assistive tech; a label describes it instead.
 */
export function ProductPreview() {
  const { t } = useTranslation()

  return (
    <figure className="m-0 animate-rise" style={delay(600)} aria-label={t('landing_preview_label')}>
      <div className="overflow-hidden rounded-panel border border-line bg-bg shadow-modal transition-shadow duration-300 hover:shadow-pop" aria-hidden>
        <div className="flex h-8 items-center gap-2 border-b border-line bg-surface px-3">
          <span className="flex gap-1">
            <span className="size-2 rounded-full bg-rose-400" />
            <span className="size-2 rounded-full bg-amber-400" />
            <span className="size-2 rounded-full bg-emerald-400" />
          </span>
          <span className="mx-auto flex items-center gap-1.5 text-[11px] font-medium text-fg-3">
            <LogoMark className="size-3.5 rounded-[3px]" />
            {t('landing_preview_window_title')}
          </span>
        </div>

        <div className="flex flex-col gap-2.5 p-3 sm:p-4">
          <p className="animate-rise text-sm font-semibold text-fg" style={delay(700)}>
            {t('landing_preview_greeting')}
          </p>

          <div className="grid grid-cols-3 gap-2">
            <Metric icon={<CalendarClock />} label={t('landing_preview_due_today')} value={formatNumber(4)} ms={760} />
            <Metric icon={<CircleCheckBig />} label={t('landing_preview_completed')} value={formatNumber(18)} highlight ms={820} />
            <Metric icon={<Flame />} label={t('landing_preview_focus')} value={formatMinutes(135)} ms={880} />
          </div>

          <div className="grid gap-2 sm:grid-cols-[1.4fr_1fr]">
            <div className="animate-rise rounded-menu border border-line bg-surface" style={delay(940)}>
              <p className="flex items-center gap-1.5 border-b border-line px-2.5 py-1.5 text-[11px] font-semibold text-fg">
                <Star className="size-3 fill-amber-400 text-amber-400" />
                {t('landing_preview_priorities')}
              </p>
              <ul className="divide-y divide-line">
                {PREVIEW_TASKS.map((task) => (
                  <li key={task.id} className="flex items-center gap-2 px-2.5 py-1.5">
                    <Checkbox round size="sm" checked={task.status === 'done'} readOnly tabIndex={-1} />
                    <span className={cn('min-w-0 flex-1 truncate text-xs', task.status === 'done' ? 'text-fg-2' : 'text-fg')}>{t(task.titleKey)}</span>
                    {task.status === 'done' ? <StatusBadge status="done" /> : <PriorityBadge priority={task.priority} />}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <div className="animate-rise rounded-menu border border-line bg-surface px-2.5 py-2" style={delay(1000)}>
                <p className="mb-1.5 text-[11px] font-semibold text-fg">{t('landing_preview_projects')}</p>
                <ul className="flex flex-col gap-1.5">
                  {PREVIEW_PROJECTS.map((project, index) => (
                    <li key={project.id}>
                      <div className="flex items-center gap-1.5 text-[11px] text-fg-2">
                        <ProjectDot color={project.color} />
                        <span className="min-w-0 flex-1 truncate">{t(project.nameKey)}</span>
                        <span className="tabular font-medium text-fg">{formatNumber(project.percent)}%</span>
                      </div>
                      <div className="mt-1 h-1 overflow-hidden rounded-full bg-surface-3">
                        <div
                          className={cn('h-full origin-left animate-grow rounded-full', PROJECT_COLOR_STYLES[project.color].solid)}
                          style={{ width: `${project.percent}%`, animationDelay: `${1100 + index * 120}ms` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex animate-rise items-center gap-2.5 rounded-menu border border-line bg-surface px-2.5 py-2" style={delay(1060)}>
                <span className="relative flex size-9 shrink-0 items-center justify-center">
                  <svg viewBox="0 0 36 36" className="size-full -rotate-90">
                    <circle cx="18" cy="18" r="15" fill="none" strokeWidth="3" className="stroke-surface-3" />
                    <circle cx="18" cy="18" r="15" fill="none" strokeWidth="3" strokeLinecap="round" strokeDasharray="94.2" strokeDashoffset="38" className="stroke-brand" />
                  </svg>
                  <Timer className="absolute size-3.5 text-brand-ink" />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-fg">{t('landing_preview_focus_mode')}</p>
                  <p className="tabular truncate text-[11px] text-fg-3">
                    14:52 · {t('landing_preview_focus_task')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </figure>
  )
}
