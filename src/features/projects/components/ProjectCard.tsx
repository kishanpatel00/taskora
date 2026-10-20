import { CalendarDays, ListChecks } from 'lucide-react'
import { memo } from 'react'
import { Link } from 'react-router-dom'
import { ProjectStatusBadge } from '@/components/shared/StatusBadge'
import { Progress } from '@/components/ui/Progress'
import { formatDateLabel } from '@/lib/date'
import { cn } from '@/lib/cn'
import { useTranslation } from '@/i18n/useTranslation'
import type { DateKey } from '@/types/common'
import { PROJECT_COLOR_STYLES } from '../projectStyles'
import type { Project, ProjectProgress } from '../projectTypes'
import { ProjectAvatar } from './ProjectAvatar'
import { ProjectMenu } from './ProjectMenu'

interface ProjectItemProps {
  project: Project
  progress: ProjectProgress
  today: DateKey
  onDelete: (project: Project) => void
}

function DueLabel({ project, today }: { project: Project; today: DateKey }) {
  const { t } = useTranslation()
  if (!project.dueDate) return <span className="text-fg-3">{t('projects_no_due_date')}</span>
  const late = project.status !== 'completed' && project.dueDate < today
  return (
    <span className={cn('inline-flex items-center gap-1', late ? 'font-medium text-rose-600 dark:text-rose-400' : 'text-fg-3')}>
      <CalendarDays className="size-3.5" aria-hidden />
      {late && <span className="sr-only">{t('projects_past_due')} </span>}
      {formatDateLabel(project.dueDate, today)}
    </span>
  )
}

/** Grid card. The title link is stretched over the card so the whole card is clickable. */
export const ProjectCard = memo(function ProjectCard({ project, progress, today, onDelete }: ProjectItemProps) {
  const { t } = useTranslation()
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-panel border border-line bg-surface transition-colors hover:border-line-strong">
      <div className={cn('h-0.5', PROJECT_COLOR_STYLES[project.color].solid)} aria-hidden />
      <div className="flex flex-1 flex-col gap-2.5 p-3.5">
        <div className="flex items-start gap-2.5">
          <ProjectAvatar color={project.color} icon={project.icon} size="sm" className="mt-0.5" />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold text-fg">
              <Link to={`/projects/${project.id}`} className="outline-none after:absolute after:inset-0 after:rounded-panel focus-visible:after:ring-2 focus-visible:after:ring-ring">
                {project.name}
              </Link>
            </h3>
            <ProjectStatusBadge status={project.status} className="mt-0.5" />
          </div>
          <ProjectMenu project={project} onDelete={onDelete} className="relative z-10 -mt-1 -mr-1.5" />
        </div>
        <p className="line-clamp-2 min-h-10 text-xs leading-5 text-fg-2">{project.description || t('projects_no_description')}</p>
        <div className="mt-auto flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-fg-3">{t('projects_progress')}</span>
            <span className="tabular font-semibold text-fg">{progress.percent}%</span>
          </div>
          <Progress value={progress.percent} label={t('project_progress_label', { name: project.name })} size="xs" barClassName={PROJECT_COLOR_STYLES[project.color].solid} />
        </div>
        <div className="flex items-center justify-between border-t border-line pt-2 text-xs">
          <span className="inline-flex items-center gap-1 text-fg-3">
            <ListChecks className="size-3" aria-hidden />
            {t('projects_task_count', { done: progress.completed, total: progress.total })}
          </span>
          <DueLabel project={project} today={today} />
        </div>
      </div>
    </article>
  )
})

/** Compact row for the list layout. */
export const ProjectRow = memo(function ProjectRow({ project, progress, today, onDelete }: ProjectItemProps) {
  const { t } = useTranslation()
  return (
    <div className="group relative grid h-11 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 px-3 transition-colors hover:bg-surface-2 md:grid-cols-[minmax(0,2.4fr)_100px_minmax(0,1.2fr)_70px_110px_28px]">
      <div className="flex min-w-0 items-center gap-2.5">
        <ProjectAvatar color={project.color} icon={project.icon} size="sm" />
        <div className="flex min-w-0 items-baseline gap-2">
          <Link to={`/projects/${project.id}`} className="shrink-0 truncate text-sm font-medium text-fg outline-none after:absolute after:inset-0 focus-visible:after:ring-2 focus-visible:after:ring-ring">
            {project.name}
          </Link>
          <p className="hidden truncate text-xs text-fg-3 xl:block">{project.description}</p>
        </div>
      </div>
      <div className="hidden md:block">
        <ProjectStatusBadge status={project.status} />
      </div>
      <div className="hidden items-center gap-2 md:flex">
        <Progress value={progress.percent} label={t('project_progress_label', { name: project.name })} size="xs" barClassName={PROJECT_COLOR_STYLES[project.color].solid} />
        <span className="tabular w-9 text-right text-xs font-medium text-fg">{progress.percent}%</span>
      </div>
      <span className="tabular hidden text-xs text-fg-2 md:block">
        {progress.completed}/{progress.total}
      </span>
      <span className="hidden text-xs md:block">
        <DueLabel project={project} today={today} />
      </span>
      <ProjectMenu project={project} onDelete={onDelete} className="relative z-10" />
    </div>
  )
})
