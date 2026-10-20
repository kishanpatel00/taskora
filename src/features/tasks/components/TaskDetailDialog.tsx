import { CheckCheck, CircleCheck, CirclePlus, Clock, Hash, Pencil, RotateCcw, Timer, Trash, type LucideIcon } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { DueDate } from '@/components/shared/DateDisplay'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Modal, ModalBody, ModalFooter } from '@/components/ui/Modal'
import { Progress } from '@/components/ui/Progress'
import { Select } from '@/components/ui/Select'
import { timerTaskSelected } from '@/features/focus/focusSlice'
import { ProjectAvatar } from '@/features/projects/components/ProjectAvatar'
import { selectProjectEntities, selectProjectsSorted } from '@/features/projects/projectSelectors'
import { useToday } from '@/hooks/useToday'
import { formatShortDate, formatRelativeTime } from '@/lib/date'
import { cn } from '@/lib/cn'
import { formatMinutes } from '@/lib/format'
import i18n from '@/i18n'
import { useTranslation } from '@/i18n/useTranslation'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { useTaskActions } from '../hooks/useTaskActions'
import { taskToFormValues } from '../schemas/taskFormSchema'
import { selectTaskById } from '../taskSelectors'
import { subtaskToggled, taskUpdated } from '../taskSlice'
import { pickOption, usePriorityOptions, useStatusOptions } from '../hooks/useTaskOptions'
import { buildTaskActivity, type TaskActivityEntry } from '../taskActivity'
import { getSubtaskProgress } from '../taskUtils'
import { TaskForm } from './TaskForm'

export type TaskDialogMode = 'view' | 'edit'

interface TaskDetailDialogProps {
  taskId: string
  mode: TaskDialogMode
  onModeChange: (mode: TaskDialogMode) => void
  onClose: () => void
}


const ACTIVITY_ICONS: Record<TaskActivityEntry['kind'], LucideIcon> = {
  created: CirclePlus,
  updated: Pencil,
  completed: CircleCheck,
  focus: Timer,
}

function describeActivity(entry: TaskActivityEntry): string {
  switch (entry.kind) {
    case 'created':
      return i18n.t('task_activity_created')
    case 'updated':
      return i18n.t('task_activity_updated')
    case 'completed':
      return i18n.t('task_activity_completed')
    case 'focus':
      return i18n.t(entry.interrupted ? 'task_activity_focus_stopped' : 'task_activity_focus', { duration: formatMinutes(entry.minutes ?? 0) })
  }
}

/** Label + value line in the properties sidebar. Inside a <dl> pass as="dt" for term/definition semantics. */
function PropertyRow({ label, children, as = 'div' }: { label: string; children: ReactNode; as?: 'div' | 'dt' }) {
  if (as === 'dt') {
    return (
      <div className="grid grid-cols-[72px_minmax(0,1fr)] items-start gap-2">
        <dt className="pt-px text-xs text-fg-3">{label}</dt>
        <dd className="min-w-0 text-fg">{children}</dd>
      </div>
    )
  }
  return (
    <div className="grid grid-cols-[72px_minmax(0,1fr)] items-center gap-2">
      <span className="text-xs text-fg-3">{label}</span>
      <div className="min-w-0">{children}</div>
    </div>
  )
}

export function TaskDetailDialog({ taskId, mode, onModeChange, onClose }: TaskDetailDialogProps) {
  const { t } = useTranslation()
  const statusOptions = useStatusOptions()
  const priorityOptions = usePriorityOptions()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const today = useToday()
  const task = useAppSelector((state) => selectTaskById(state, taskId))
  const projects = useAppSelector(selectProjectsSorted)
  const projectEntities = useAppSelector(selectProjectEntities)
  const { toggleComplete, deleteTask } = useTaskActions()
  const sessions = useAppSelector((state) => state.focus.sessions)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  if (!task) return null
  const project = task.projectId ? projectEntities[task.projectId] : undefined
  const done = task.status === 'done'

  if (mode === 'edit') {
    return (
      <Modal open onClose={() => onModeChange('view')} title={t('tasks_edit_title')} size="lg">
        <TaskForm
          initialValues={taskToFormValues(task)}
          projects={projects}
          submitLabel={t('common_save_changes')}
          onCancel={() => onModeChange('view')}
          onSubmit={(input) => {
            dispatch(taskUpdated(task.id, input))
            toast.success(t('toast_task_updated'))
            onModeChange('view')
          }}
        />
      </Modal>
    )
  }

  const subtaskProgress = getSubtaskProgress(task)
  const sortedSubtasks = [...task.subtasks].sort((a, b) => a.order - b.order)
  const activity = buildTaskActivity(task, sessions)

  return (
    <>
      <Modal open onClose={onClose} title={task.title} headerExtra={<StatusBadge status={task.status} />} size="xl">
        <ModalBody flush className="grid md:grid-cols-[minmax(0,1fr)_232px]">
          <div className="flex min-w-0 flex-col gap-4 px-4 py-3.5">
            <section aria-label={t('common_description')}>
              {task.description ? (
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-fg-2">{task.description}</p>
              ) : (
                <p className="text-sm text-fg-3">{t('task_detail_no_description')}</p>
              )}
            </section>

            <section aria-labelledby={`${task.id}-subtasks`} className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <h3 id={`${task.id}-subtasks`} className="text-xs font-semibold tracking-wide text-fg-3 uppercase">
                  {t('task_detail_subtasks')}
                </h3>
                {subtaskProgress.total > 0 && (
                  <>
                    <Progress
                      value={(subtaskProgress.completed / subtaskProgress.total) * 100}
                      label={t('task_detail_subtask_progress')}
                      size="xs"
                      className="max-w-32"
                    />
                    <span className="tabular text-xs text-fg-3">
                      {subtaskProgress.completed}/{subtaskProgress.total}
                    </span>
                  </>
                )}
              </div>
              {subtaskProgress.total > 0 ? (
                <ul className="flex flex-col rounded-menu border border-line">
                  {sortedSubtasks.map((subtask) => (
                    <li key={subtask.id} className="border-b border-line last:border-b-0">
                      <label className="flex h-8 cursor-pointer items-center gap-2.5 px-2.5 hover:bg-surface-2">
                        <Checkbox size="sm" checked={subtask.completed} onChange={() => dispatch(subtaskToggled(task.id, subtask.id))} />
                        <span className={subtask.completed ? 'truncate text-sm text-fg-2' : 'truncate text-sm text-fg'}>
                          {subtask.title}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-fg-3">
                  {t('task_detail_no_subtasks')}{' '}
                  <button type="button" className="font-medium text-brand-ink hover:underline" onClick={() => onModeChange('edit')}>
                    {t('task_detail_add_subtasks')}
                  </button>
                </p>
              )}
            </section>

            <section aria-labelledby={`${task.id}-activity`} className="flex flex-col gap-1.5">
              <h3 id={`${task.id}-activity`} className="text-xs font-semibold tracking-wide text-fg-3 uppercase">
                {t('task_detail_activity')}
              </h3>
              <ol className="flex flex-col">
                {activity.map((entry) => {
                  const Icon = ACTIVITY_ICONS[entry.kind]
                  return (
                    <li key={entry.id} className="flex items-center gap-2 py-1 text-sm">
                      <Icon className={cn('size-3.5 shrink-0', entry.kind === 'completed' ? 'text-emerald-500' : entry.kind === 'focus' ? 'text-accent' : 'text-fg-3')} aria-hidden />
                      <span className="min-w-0 flex-1 truncate text-fg-2">{describeActivity(entry)}</span>
                      <time dateTime={entry.at} className="shrink-0 text-xs text-fg-3" title={new Date(entry.at).toLocaleString()}>
                        {formatRelativeTime(entry.at)}
                      </time>
                    </li>
                  )
                })}
              </ol>
            </section>
          </div>

          <aside aria-label={t('task_detail_properties')} className="flex flex-col gap-2.5 border-line bg-surface-2 px-4 py-3.5 md:border-l">
            <PropertyRow label={t('task_detail_status')}>
              <Select
                size="sm"
                aria-label={t('task_detail_status')}
                options={statusOptions}
                value={task.status}
                onChange={(event) => {
                  const status = pickOption(statusOptions, event.target.value)
                  if (status) dispatch(taskUpdated(task.id, { status }))
                }}
              />
            </PropertyRow>
            <PropertyRow label={t('task_detail_priority')}>
              <Select
                size="sm"
                aria-label={t('task_detail_priority')}
                options={priorityOptions}
                value={task.priority}
                onChange={(event) => {
                  const priority = pickOption(priorityOptions, event.target.value)
                  if (priority) dispatch(taskUpdated(task.id, { priority }))
                }}
              />
            </PropertyRow>
            <dl className="flex flex-col gap-2 border-t border-line pt-2.5 text-sm">
              <PropertyRow label={t('task_detail_project')} as="dt">
                {project ? (
                  <span className="flex min-w-0 items-center gap-1.5">
                    <ProjectAvatar color={project.color} icon={project.icon} size="sm" />
                    <span className="truncate">{project.name}</span>
                  </span>
                ) : (
                  t('common_inbox')
                )}
              </PropertyRow>
              <PropertyRow label={t('task_detail_due')} as="dt">
                {task.dueDate ? <DueDate date={task.dueDate} today={today} done={done} className="text-sm" /> : '—'}
              </PropertyRow>
              <PropertyRow label={t('task_detail_start')} as="dt">
                {task.startDate ? formatShortDate(task.startDate) : '—'}
              </PropertyRow>
              <PropertyRow label={t('task_detail_estimate')} as="dt">
                {task.estimatedMinutes ? (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-3 text-fg-3" aria-hidden />
                    {formatMinutes(task.estimatedMinutes)}
                  </span>
                ) : (
                  '—'
                )}
              </PropertyRow>
              <PropertyRow label={t('task_detail_tags')} as="dt">
                {task.tags.length > 0 ? (
                  <span className="flex flex-wrap gap-1">
                    {task.tags.map((tag) => (
                      <span key={tag} className="inline-flex items-center rounded-[3px] bg-surface-3 px-1 text-xs text-fg-2">
                        <Hash className="size-2.5 text-fg-3" aria-hidden />
                        {tag}
                      </span>
                    ))}
                  </span>
                ) : (
                  '—'
                )}
              </PropertyRow>
            </dl>
          </aside>
        </ModalBody>
        <ModalFooter className="sm:justify-between">
          <Button
            variant="danger-ghost"
            leftIcon={<Trash />}
            onClick={() => setConfirmingDelete(true)}
          >
            {t('common_delete')}
          </Button>
          <div className="flex flex-col-reverse gap-1.5 sm:flex-row">
            {!done && (
              <Button
                variant="secondary"
                leftIcon={<Timer />}
                onClick={() => {
                  dispatch(timerTaskSelected(task.id))
                  onClose()
                  void navigate('/focus')
                }}
              >
                {t('task_detail_focus')}
              </Button>
            )}
            <Button variant="secondary" leftIcon={<Pencil />} onClick={() => onModeChange('edit')}>
              {t('common_edit')}
            </Button>
            <Button leftIcon={done ? <RotateCcw /> : <CheckCheck />} onClick={() => toggleComplete(task)}>
              {done ? t('task_detail_reopen') : t('task_detail_complete')}
            </Button>
          </div>
        </ModalFooter>
      </Modal>
      <ConfirmDialog
        open={confirmingDelete}
        title={t('task_delete_title')}
        description={t('task_delete_description', { title: task.title, count: task.subtasks.length })}
        confirmLabel={t('task_delete_confirm')}
        onCancel={() => setConfirmingDelete(false)}
        onConfirm={() => {
          setConfirmingDelete(false)
          onClose()
          deleteTask(task)
        }}
      />
    </>
  )
}
