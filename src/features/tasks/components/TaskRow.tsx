import { memo, type ReactNode } from 'react'
import { useDialogs } from '@/app/dialogs/useDialogs'
import { PriorityBadge } from '@/components/shared/PriorityBadge'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Checkbox } from '@/components/ui/Checkbox'
import type { Project } from '@/features/projects/projectTypes'
import { cn } from '@/lib/cn'
import { useTranslation } from '@/i18n/useTranslation'
import type { DateKey } from '@/types/common'
import { useTaskActions } from '../hooks/useTaskActions'
import type { Task } from '../taskTypes'
import { isTaskDone } from '../taskUtils'
import { TaskMeta } from './TaskMeta'

interface TaskRowProps {
  task: Task
  today: DateKey
  project?: Project
  showProject?: boolean
  /** Rendered before the checkbox (e.g. drag handle). */
  leading?: ReactNode
  /** Rendered at the end of the row (e.g. pin button). */
  trailing?: ReactNode
  className?: string
}

export const TaskRow = memo(function TaskRow({
  task,
  today,
  project,
  showProject = true,
  leading,
  trailing,
  className,
}: TaskRowProps) {
  const { t } = useTranslation()
  const { openTask } = useDialogs()
  const { toggleComplete } = useTaskActions()
  const done = isTaskDone(task)

  return (
    <div className={cn('group flex items-start gap-2.5 px-3 py-[7px] transition-colors hover:bg-surface-2', className)}>
      {leading}
      <Checkbox
        round
        checked={done}
        onChange={() => toggleComplete(task)}
        aria-label={done ? t('task_mark_not_done', { title: task.title }) : t('task_mark_done', { title: task.title })}
        className="mt-[3px]"
      />
      <div className="min-w-0 flex-1">
        <button
          type="button"
          onClick={() => openTask(task.id)}
          className={cn(
            'line-clamp-2 rounded-control text-left text-sm font-medium transition-colors hover:text-brand-ink',
            done ? 'text-fg-2' : 'text-fg',
          )}
        >
          {task.title}
        </button>
        <TaskMeta task={task} today={today} project={project} showProject={showProject} className="mt-0.5" />
      </div>
      {done ? (
        <StatusBadge status="done" className="mt-0.5" />
      ) : (
        <PriorityBadge priority={task.priority} className="mt-px max-sm:hidden" />
      )}
      {trailing}
    </div>
  )
})
