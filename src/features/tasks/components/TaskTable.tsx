import { ArrowDown, ArrowUp, ChevronsUpDown, Clock, ListChecks } from 'lucide-react'
import { memo, useMemo, useState } from 'react'
import { useDialogs } from '@/app/dialogs/useDialogs'
import { DueDate } from '@/components/shared/DateDisplay'
import { PriorityBadge } from '@/components/shared/PriorityBadge'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Checkbox } from '@/components/ui/Checkbox'
import { ProjectDot } from '@/features/projects/components/ProjectAvatar'
import type { Project } from '@/features/projects/projectTypes'
import { cn } from '@/lib/cn'
import { formatMinutes } from '@/lib/format'
import { useTranslation } from '@/i18n/useTranslation'
import type { DateKey, SortDirection } from '@/types/common'
import { useTaskActions } from '../hooks/useTaskActions'
import type { Task, TaskSortKey } from '../taskTypes'
import { getSubtaskProgress, isTaskDone, sortTasks } from '../taskUtils'
import { TaskMeta } from './TaskMeta'

type SortableColumn = Exclude<TaskSortKey, 'manual' | 'createdAt'>

interface TaskTableProps {
  tasks: Task[]
  today: DateKey
  projects: Record<string, Project>
  showProject?: boolean
  /** Accessible name of the table. */
  label: string
  initialSort?: SortableColumn
}

/**
 * Dense, sortable task table (36px rows). On narrow screens the secondary
 * columns collapse into a metadata line under the title.
 */
export function TaskTable({ tasks, today, projects, showProject = true, label, initialSort = 'dueDate' }: TaskTableProps) {
  const { t } = useTranslation()
  const [sort, setSort] = useState<{ key: SortableColumn; direction: SortDirection }>({ key: initialSort, direction: 'asc' })

  const rows = useMemo(() => {
    const sorted = sortTasks(tasks, sort.key)
    return sort.direction === 'asc' ? sorted : sorted.reverse()
  }, [tasks, sort])

  const toggleSort = (key: SortableColumn) =>
    setSort((current) => ({ key, direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc' }))

  const header = (key: SortableColumn, text: string, className?: string) => {
    const active = sort.key === key
    const Icon = !active ? ChevronsUpDown : sort.direction === 'asc' ? ArrowUp : ArrowDown
    return (
      <th scope="col" aria-sort={active ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'} className={cn('px-2 py-0 font-medium', className)}>
        <button
          type="button"
          onClick={() => toggleSort(key)}
          className={cn('-mx-1 inline-flex h-8 items-center gap-1 rounded-control px-1 hover:text-fg', active && 'text-fg')}
        >
          {text}
          <Icon className={cn('size-3', !active && 'opacity-50')} aria-hidden />
        </button>
      </th>
    )
  }

  return (
    <div className="overflow-x-auto scrollbar-thin">
      <table className="w-full min-w-0 table-fixed border-collapse text-left text-sm">
        <caption className="sr-only">{label}</caption>
        <thead className="border-b border-line bg-surface-2 text-xs text-fg-3">
          <tr>
            {header('title', t('task_table_task'), 'pl-3')}
            {showProject && (
              <th scope="col" className="hidden w-40 px-2 font-medium lg:table-cell">
                {t('task_table_project')}
              </th>
            )}
            {header('status', t('task_table_status'), 'hidden w-28 md:table-cell')}
            {header('priority', t('task_table_priority'), 'w-[92px]')}
            {header('dueDate', t('task_table_due'), 'hidden w-28 sm:table-cell')}
            <th scope="col" className="hidden w-20 px-2 font-medium xl:table-cell">
              {t('task_table_estimate')}
            </th>
            <th scope="col" className="hidden w-20 px-2 pr-3 font-medium xl:table-cell">
              {t('task_table_subtasks')}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((task) => (
            <TaskTableRow
              key={task.id}
              task={task}
              today={today}
              project={task.projectId ? projects[task.projectId] : undefined}
              showProject={showProject}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

const TaskTableRow = memo(function TaskTableRow({
  task,
  today,
  project,
  showProject,
}: {
  task: Task
  today: DateKey
  project: Project | undefined
  showProject: boolean
}) {
  const { t } = useTranslation()
  const { openTask } = useDialogs()
  const { toggleComplete } = useTaskActions()
  const done = isTaskDone(task)
  const subtasks = getSubtaskProgress(task)

  return (
    <tr className="group border-b border-line last:border-b-0 hover:bg-surface-2">
      <td className="py-2 pr-2 pl-3 align-middle">
        <div className="flex min-w-0 items-start gap-2.5">
          <Checkbox
            round
            checked={done}
            onChange={() => toggleComplete(task)}
            aria-label={done ? t('task_mark_not_done', { title: task.title }) : t('task_mark_done', { title: task.title })}
            className="mt-px"
          />
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-baseline gap-2">
              <button
                type="button"
                onClick={() => openTask(task.id)}
                className={cn(
                  'max-w-full shrink-0 truncate rounded-control text-left font-medium hover:text-brand-ink sm:max-w-[75%]',
                  done ? 'text-fg-2' : 'text-fg',
                )}
              >
                {task.title}
              </button>
              {task.tags.length > 0 && (
                <span className="hidden min-w-0 truncate text-xs text-fg-3 sm:inline">{task.tags.map((tag) => `#${tag}`).join(' ')}</span>
              )}
            </div>
            {/* Narrow screens: hidden columns become a metadata line. */}
            <TaskMeta task={task} today={today} project={project} showProject={showProject} maxTags={1} className="mt-0.5 sm:hidden" />
          </div>
        </div>
      </td>
      {showProject && (
        <td className="hidden px-2 align-middle lg:table-cell">
          <span className="flex min-w-0 items-center gap-1.5 text-xs text-fg-2">
            {project ? <ProjectDot color={project.color} /> : <span className="size-2 shrink-0 rounded-full border border-fg-3" aria-hidden />}
            <span className="truncate">{project?.name ?? t('common_inbox')}</span>
          </span>
        </td>
      )}
      <td className="hidden px-2 align-middle md:table-cell">
        <StatusBadge status={task.status} />
      </td>
      <td className="px-2 align-middle">
        <PriorityBadge priority={task.priority} />
      </td>
      <td className="hidden px-2 align-middle sm:table-cell">
        {task.dueDate ? <DueDate date={task.dueDate} today={today} done={done} /> : <span className="text-xs text-fg-3">—</span>}
      </td>
      <td className="hidden px-2 align-middle text-xs text-fg-2 xl:table-cell">
        {task.estimatedMinutes !== null ? (
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3 text-fg-3" aria-hidden />
            {formatMinutes(task.estimatedMinutes)}
          </span>
        ) : (
          <span className="text-fg-3">—</span>
        )}
      </td>
      <td className="hidden px-2 pr-3 align-middle text-xs text-fg-2 xl:table-cell">
        {subtasks.total > 0 ? (
          <span className="tabular inline-flex items-center gap-1">
            <ListChecks className="size-3 text-fg-3" aria-hidden />
            {subtasks.completed}/{subtasks.total}
          </span>
        ) : (
          <span className="text-fg-3">—</span>
        )}
      </td>
    </tr>
  )
})
