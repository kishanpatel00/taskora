import { Clock, Hash, ListChecks } from 'lucide-react'
import { DueDate } from '@/components/shared/DateDisplay'
import { ProjectDot } from '@/features/projects/components/ProjectAvatar'
import type { Project } from '@/features/projects/projectTypes'
import { useTranslation } from '@/i18n/useTranslation'
import { cn } from '@/lib/cn'
import { formatMinutes } from '@/lib/format'
import type { DateKey } from '@/types/common'
import type { Task } from '../taskTypes'
import { getSubtaskProgress, isTaskDone } from '../taskUtils'

interface TaskMetaProps {
  task: Task
  today: DateKey
  project?: Project
  showProject?: boolean
  maxTags?: number
  className?: string
}

/** Compact metadata line: project, due date, subtasks, estimate, tags. */
export function TaskMeta({ task, today, project, showProject = false, maxTags = 2, className }: TaskMetaProps) {
  const { t } = useTranslation()
  const subtasks = getSubtaskProgress(task)
  const hiddenTags = task.tags.length - maxTags
  return (
    <div className={cn('flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-fg-3', className)}>
      {showProject && (
        <span className="inline-flex max-w-40 items-center gap-1.5">
          {project ? <ProjectDot color={project.color} /> : <span className="size-2 rounded-full border border-fg-3" aria-hidden />}
          <span className="truncate">{project?.name ?? t('common_inbox')}</span>
        </span>
      )}
      {task.dueDate && <DueDate date={task.dueDate} today={today} done={isTaskDone(task)} />}
      {subtasks.total > 0 && (
        <span className="tabular inline-flex items-center gap-1" title={t('task_meta_subtasks_title')}>
          <ListChecks className="size-3" aria-hidden />
          {subtasks.completed}/{subtasks.total}
          <span className="sr-only">{t('task_meta_subtasks_done')}</span>
        </span>
      )}
      {task.estimatedMinutes !== null && (
        <span className="inline-flex items-center gap-1" title={t('task_meta_estimate_title')}>
          <Clock className="size-3" aria-hidden />
          {formatMinutes(task.estimatedMinutes)}
        </span>
      )}
      {task.tags.slice(0, maxTags).map((tag) => (
        <span key={tag} className="inline-flex items-center">
          <Hash className="size-3" aria-hidden />
          {tag}
        </span>
      ))}
      {hiddenTags > 0 && <span>+{hiddenTags}</span>}
    </div>
  )
}
