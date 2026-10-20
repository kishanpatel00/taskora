import { ArrowRight, CalendarClock, CircleCheck, CirclePlus, Flag, FolderKanban, History, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useDialogs } from '@/app/dialogs/useDialogs'
import { PRIORITY_FLAG_COLORS } from '@/components/shared/badgeStyles'
import { DueDate } from '@/components/shared/DateDisplay'
import { Card, CardHeader } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Progress } from '@/components/ui/Progress'
import { ProjectAvatar, ProjectDot } from '@/features/projects/components/ProjectAvatar'
import { PROJECT_COLOR_STYLES } from '@/features/projects/projectStyles'
import type { Project, ProjectProgress } from '@/features/projects/projectTypes'
import { TaskRow } from '@/features/tasks/components/TaskRow'
import { PRIORITY_LABEL_KEYS, type Task } from '@/features/tasks/taskTypes'
import { useTranslation } from '@/i18n/useTranslation'
import { formatRelativeTime } from '@/lib/date'
import { cn } from '@/lib/cn'
import type { DateKey } from '@/types/common'
import type { ActivityItem } from '../dashboardMetrics'

const viewAll = (to: string, label: string) => (
  <Link to={to} className="inline-flex items-center gap-1 rounded-control px-1 text-xs font-medium text-brand-ink hover:underline">
    {label}
    <ArrowRight className="size-3" aria-hidden />
  </Link>
)

type ProjectMap = Record<string, Project>

export function TopPrioritiesCard({ tasks, today, projects }: { tasks: Task[]; today: DateKey; projects: ProjectMap }) {
  const { t } = useTranslation()
  return (
    <Card className="flex flex-col">
      <CardHeader title={t('dashboard_priorities_title')} icon={<Star />} action={viewAll('/today', t('dashboard_plan_day'))} className="border-b border-line" />
      {tasks.length === 0 ? (
        <EmptyState compact icon={<CircleCheck />} title={t('dashboard_priorities_empty_title')} description={t('dashboard_priorities_empty_description')} />
      ) : (
        <ol className="divide-y divide-line">
          {tasks.map((task) => (
            <li key={task.id}>
              <TaskRow task={task} today={today} project={task.projectId ? projects[task.projectId] : undefined} />
            </li>
          ))}
        </ol>
      )}
    </Card>
  )
}

export function UpcomingCard({ tasks, today, projects }: { tasks: Task[]; today: DateKey; projects: ProjectMap }) {
  const { t } = useTranslation()
  const { openTask } = useDialogs()
  return (
    <Card>
      <CardHeader title={t('dashboard_upcoming_title')} description={t('dashboard_upcoming_hint')} icon={<CalendarClock />} className="border-b border-line" />
      {tasks.length === 0 ? (
        <EmptyState compact icon={<CalendarClock />} title={t('dashboard_upcoming_empty_title')} description={t('dashboard_upcoming_empty_description')} />
      ) : (
        <ul className="divide-y divide-line">
          {tasks.map((task) => {
            const project = task.projectId ? projects[task.projectId] : undefined
            return (
              <li key={task.id}>
                <button
                  type="button"
                  onClick={() => openTask(task.id)}
                  className="flex h-9 w-full items-center gap-2.5 px-3.5 text-left hover:bg-surface-2"
                >
                  <Flag className={cn('size-3.5 shrink-0', PRIORITY_FLAG_COLORS[task.priority])} aria-label={t('task_priority_suffix', { priority: t(PRIORITY_LABEL_KEYS[task.priority]) })} />
                  <span className="min-w-0 flex-1 truncate text-sm text-fg">{task.title}</span>
                  <span className="hidden max-w-36 items-center gap-1.5 truncate text-xs text-fg-3 sm:flex">
                    {project && <ProjectDot color={project.color} />}
                    <span className="truncate">{project?.name ?? t('common_inbox')}</span>
                  </span>
                  {task.dueDate && <DueDate date={task.dueDate} today={today} className="w-24 justify-end" />}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}

export function ActivityCard({ items, projects }: { items: ActivityItem[]; projects: ProjectMap }) {
  const { t } = useTranslation()
  const { openTask } = useDialogs()
  return (
    <Card>
      <CardHeader title={t('dashboard_activity_title')} icon={<History />} className="border-b border-line" />
      {items.length === 0 ? (
        <EmptyState compact icon={<History />} title={t('dashboard_activity_empty')} />
      ) : (
        <ol className="flex flex-col py-1">
          {items.map((item) => {
            const project = item.task.projectId ? projects[item.task.projectId] : undefined
            const Icon = item.kind === 'completed' ? CircleCheck : CirclePlus
            return (
              <li key={item.id} className="flex gap-2.5 px-3.5 py-1.5">
                <Icon
                  className={cn('mt-0.5 size-3.5 shrink-0', item.kind === 'completed' ? 'text-emerald-500' : 'text-fg-3')}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-fg-2">
                    {item.kind === 'completed' ? t('dashboard_activity_completed') : t('dashboard_activity_created')}{' '}
                    <button type="button" onClick={() => openTask(item.task.id)} className="font-medium text-fg hover:text-brand-ink">
                      {item.task.title}
                    </button>
                  </p>
                  <p className="truncate text-xs text-fg-3">
                    {project?.name ?? t('common_inbox')} · {formatRelativeTime(item.at)}
                  </p>
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </Card>
  )
}

export function RecentProjectsCard({ projects, progress }: { projects: Project[]; progress: Record<string, ProjectProgress> }) {
  const { t } = useTranslation()
  return (
    <Card>
      <CardHeader title={t('dashboard_projects_title')} icon={<FolderKanban />} action={viewAll('/projects', t('dashboard_all_projects'))} className="border-b border-line" />
      <ul className="divide-y divide-line">
        {projects.map((project) => {
          const value = progress[project.id]
          return (
            <li key={project.id}>
              <Link to={`/projects/${project.id}`} className="flex h-11 items-center gap-3 px-3.5 hover:bg-surface-2">
                <ProjectAvatar color={project.color} icon={project.icon} size="sm" />
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-fg">{project.name}</span>
                <span className="tabular hidden w-16 text-right text-xs text-fg-3 sm:block">
                  {t('dashboard_project_tasks', { done: value?.completed ?? 0, total: value?.total ?? 0 })}
                </span>
                <span className="flex w-28 items-center gap-2 sm:w-36">
                  <Progress
                    value={value?.percent ?? 0}
                    label={t('project_progress_label', { name: project.name })}
                    size="xs"
                    barClassName={PROJECT_COLOR_STYLES[project.color].solid}
                  />
                  <span className="tabular w-8 text-right text-xs font-medium text-fg">{value?.percent ?? 0}%</span>
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
